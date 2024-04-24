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

const CheckForm = () => {
    const [enhancerStart, setEnhancerStart] = useState("");
    const [enhancerStop, setEnhancerStop] = useState("");
    const [genePosition, setGenePosition] = useState("");
    const [isInteract, setIsInteract] = useState("");
    // const [interactWhere, setInteractWhere] = useState("");
    const toast = useToast();
    const { auth, setAuth } = useContext(AuthContext);

    const checkInteractions = () => {
        if (!enhancerStart || !enhancerStop || !genePosition) {
            toast({
                title: "Warning",
                description: "Please fill in all the fields.",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
                variant: "left-accent",
            });
            return;
        }

        let headers = {
            "Content-Type": "multipart/form-data",
          };
      
          if (auth && auth.accessToken) {
            headers["Authorization"] = `Bearer ${auth.accessToken}`;
          }

        axios
        .post(
        "/api/check",
        {
            enhancerStart,
            enhancerStop,
            genePosition,    
        },
        {
            headers: headers,
        }
        )
        .then((response) => {
            setIsInteract(response.data.inputString);
      })
        .catch((error) => {
            console.error("Error fetching input string:", error);
        });
    };

    return (    
        <Flex direction="column" mt="10px" mb="50px" width="400px">
            <FormControl isRequired>
                <FormLabel paddingTop="1px" fontSize="lg">
                    Enhancer Start:
                </FormLabel>
                <Input
                    className="upload-step-enhancer-start"
                    variant="filled"
                    type="text"
                    placeholder="Enhancer Start"
                    value={enhancerStart}
                    onChange={(e) => setEnhancerStart(e.target.value)}
                />

                <FormLabel fontSize="lg" mt="10px">
                    Enhancer Stop:
                </FormLabel>
                <Input
                    className="upload-step-enhancer-stop"
                    variant="filled"
                    type="text"
                    placeholder="Enhancer Stop"
                    value={enhancerStop}
                    onChange={(e) => setEnhancerStop(e.target.value)}
                />

                <FormLabel fontSize="lg" mt="10px">
                    Gene Position:
                </FormLabel>
                <Input
                    className="upload-step-gene-position"
                    variant="filled"
                    type="text"
                    placeholder="Gene Position"
                    value={genePosition}
                    onChange={(e) => setGenePosition(e.target.value)}
                />
            </FormControl>

            <Flex direction="column" my="10px" paddingTop="20px" >
                <Button
                    className="upload-step-check"
                    colorScheme="blue"
                    onClick={checkInteractions}
                >
                    Check
                </Button>
            </Flex>

            <Text className="upload-step-interacts" fontSize="lg" mt="10px">
                Interacts: {isInteract}
            </Text>

            {/* <Text className="upload-step-where" fontSize="lg" mt="10px">
                Where Interacts: {interactWhere}
            </Text> */}

        </Flex>
    );
};

export default CheckForm;