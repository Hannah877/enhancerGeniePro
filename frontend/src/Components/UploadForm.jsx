import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Select } from "chakra-react-select";
import AuthContext from "./AuthProvider";

const UploadForm = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState(sessionStorage.getItem('email') || "");
  const [file, setFile] = useState(null);
  const [showAlgorithmDropdown, setShowAlgorithmDropdown] = useState(false);
  const [tissueSelectDisabled, setTissueSelectDisabled] = useState(true);
  const [algorithmOptions, setAlgorithmOptions] = useState([]);
  const [tissueOptions, setTissueOptions] = useState([]);
  const [assemblyOptions, setAssemblyOptions] = useState([]);
  const selectTissueRef = useRef();
  const selectAlgorithmRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [assembly, setAssembly] = useState("");
  const [tissue, setTissue] = useState("");
  const [algorithms, setAlgorithms] = useState([]);

  const options = [
    { label: "Human GRCh38/hg38", value: "GRCh38" },
    { label: "Human GRCh37/hg19", value: "GRCh37" },
  ];

  const getDefaultOptions = (key, fallback) => {
    const option = sessionStorage.getItem(key);
    return option ? JSON.parse(option) : fallback;
  };
  const optionAssembly = getDefaultOptions('assembly', null);
  const optionTissue = getDefaultOptions('tissue', null);
  const optionAlgo = getDefaultOptions('algorithms', []);

  useEffect(() => {
    axios
      .get("/api/tissues")
      .then((res) => {
        setAssemblyOptions(res.data);

        // get previous search from session storage
        if (assemblyOptions) {
          if (optionAssembly) {
            const selectedAssembly = res.data.find(a => a.assembly === optionAssembly.value);
            setAssembly(selectedAssembly.assembly);
            setTissueSelectDisabled(false);
            setTissueOptions(selectedAssembly.tissues);

            if (optionTissue) {
              const selectedTissue = selectedAssembly.tissues.find(t => t.value === optionTissue.value);
              setTissue(selectedTissue.value);
              if (selectedTissue) {
                setShowAlgorithmDropdown(true);
                setAlgorithmOptions(selectedTissue.supportedAlgorithms);
                setAlgorithms(optionAlgo);
              }
            }
          } 
        }
      })
      .catch((reason) => {
        toast({
          title: "Error",
          description: reason.response.data.message,
          status: "error",
          duration: 15000,
          isClosable: true,
          position: "top",
          variant: "left-accent",
        });
        setIsProcessing(false);
      });
  }, []);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const addHistoryToCache = (fp) => {
    let history = localStorage.getItem("history");
    if (history === null) {
      localStorage.setItem(
        "history",
        `${fp}_${new Date().toISOString().replace("T", " ").slice(0, 19)}`
      );
      console.log("History created, hash stored");
    } else {
      const histArr = history.split(",");

      for (let i = 0; i < histArr.length; i++) {
        const item = histArr[i].split("_");
        // fp already exists in cache so delete it
        if (fp === item[0]) {
          histArr.splice(i, 1);
        }
      }

      localStorage.setItem(
        "history",
        `${histArr.join(",")},${fp}_${new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 19)}`
      );
    }
  };

  const handleSubmit = () => {
    setIsProcessing(true);

    // TODO: If accessToken is undefined, don't include in headers otherwise 422 error
    let headers = {
      "Content-Type": "multipart/form-data",
    };

    if (auth && auth.accessToken) {
      headers["Authorization"] = `Bearer ${auth.accessToken}`;
    }

    if (
      file &&
      tissue &&
      !file.name.toLowerCase().includes(tissue.toLowerCase())
    ) {
      const confirmUpload = window.confirm(
        `Are you sure this enhancer file matches the selected tissue: ${tissue}?`
      );
      if (!confirmUpload) {
        setIsProcessing(false);
        return;
      }
    }

    axios
      .post(
        "/api/upload",
        {
          organ: tissue,
          email: email,
          algorithms: JSON.stringify(algorithms),
          assembly: assembly,
          file: file,
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        setIsProcessing(false);
        toast({
          title: "Analysis complete.",
          description: "Click buttons below to view results.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
          variant: "left-accent",
        });

        // Pass the filename
        // const filename = response.data.filename;

        // TODO: If logged in, store history in db, else store in localStorage
        addHistoryToCache(response.data.hash);

        // navigate(`/chart_result`, { state: { data: response.data.result } });
        navigate(`/chart_results/${response.data.hash}`);
      })
      .catch((reason) => {
        if (reason.response && reason.response.status === 401) {
          toast({
            title: "Logged out",
            description: 'Your session has expired. Please log in again.',
            status: "warning",
            duration: 15000,
            isClosable: true,
            position: "top",
            variant: "left-accent",
          });
          setAuth({});
          localStorage.removeItem("user");
          navigate('/login'); 
        } else {
          toast({
            title: "Error",
            description: reason.response.data.message,
            status: "error",
            duration: 15000,
            isClosable: true,
            position: "top",
            variant: "left-accent",
          });
        }
        setIsProcessing(false);
      });
  };

  const handleAssemblySelect = (newValue) => {
    setAssembly(newValue.value);
    
    setTissueOptions(
      assemblyOptions.find((a) => a.assembly === newValue.value).tissues
    );
    setTissueSelectDisabled(false);

    if (tissueOptions.length > 0) {
      selectTissueRef.current.setValue([]);
      setTissue("");
      setShowAlgorithmDropdown(false);
    }
    sessionStorage.setItem('assembly', JSON.stringify(newValue));
  };

  const handleTissueSelect = (newValue) => {
    const algorithm = tissueOptions.find((t) => t.value === newValue.value);

    setTissue(newValue.value);
    setAlgorithmOptions(algorithm && algorithm.supportedAlgorithms);
    setShowAlgorithmDropdown(true);

    if (algorithmOptions && algorithmOptions.length > 0) {
      selectAlgorithmRef.current.setValue([]);
    }
    sessionStorage.setItem('tissue', JSON.stringify(newValue));
  };

  const handleAlgorithmSelect = (newValue) => {
    sessionStorage.setItem('algorithms', JSON.stringify(newValue));
    const selectedAlgorithms = newValue.map((algo) => algo);
    setAlgorithms(selectedAlgorithms);
  };

  const handleEmailInput = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    sessionStorage.setItem('email', newEmail);
  };

  return (
    <Flex direction="column" mt="10px" mb="50px" width="400px">
      <FormControl>
        <FormLabel paddingTop="10px" fontSize="lg">
          Select assembly:
          </FormLabel>
        <Select
          className="upload-step-assembly"
          placeholder="Select assembly"
          variant="filled"
          options={options}
          value={options.find(opt => opt.value === assembly)}
          onChange={handleAssemblySelect}
        />

        <FormLabel fontSize="lg" mt="10px">
          Select tissue:
        </FormLabel>
        <Select
          className="upload-step-tissue"
          placeholder="Select tissue"
          variant="filled"
          options={tissueOptions}
          value={tissueOptions.find(opt => opt.value === tissue)}
          onChange={handleTissueSelect}
          isDisabled={tissueSelectDisabled}
          ref={selectTissueRef}
        />

        <>
          <FormLabel fontSize="lg" mt="10px">
            Select algorithm(s):
          </FormLabel>
          <Text fontSize="sm" color="gray.600" mt="-2" mb="2">
            Some are only supported when using specific tissues/assemblies
          </Text>
          <Select
            className="upload-step-algo"
            isMulti
            placeholder="Select algorithm(s)"
            variant="filled"
            options={algorithmOptions}
            value={algorithms}
            colorScheme="blue"
            onChange={handleAlgorithmSelect}
            isDisabled={!showAlgorithmDropdown}
            ref={selectAlgorithmRef}
          />
        </>

        <FormLabel fontSize="lg" mt="10px">
          Email (optional):
        </FormLabel>
        <Text fontSize="sm" color="gray.600" mt="-2" mb="2">
          Results will be sent to the email if provided
        </Text>
        <Input
          className="upload-step-email"
          variant="filled"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={handleEmailInput}
        />

        <FormLabel fontSize="lg" mt="10px">
          File:
        </FormLabel>
        <Text fontSize="sm" color="gray.600" mt="-2" mb="2">
          Accepted file types: bed, bed.gz
        </Text>
        <Input
          className="upload-step-file"
          variant="filled"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Text fontSize="xs" color="gray.600" mt="2" mb="2">
          See usage page for more information about file requirements
        </Text>
      </FormControl>
      <Flex direction="column" my="10px">
        <Button
          className="upload-step-submit"
          colorScheme="blue"
          isLoading={isProcessing}
          onClick={handleSubmit}
        >
          Upload
        </Button>
      </Flex>
    </Flex>
  );
};

export default UploadForm;
