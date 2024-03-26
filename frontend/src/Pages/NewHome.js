import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
import UploadForm from "../Components/UploadForm";
import Joyride, { STATUS } from "react-joyride";
import AuthContext from "../Components/AuthProvider";

const NewHome = () => {
  const { auth } = useContext(AuthContext);
  const [run, setRun] = useState(false);
  
  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit") !== "false";
    setRun(isFirstVisit);
  }, []);

  const methods = [
    {
      name: "Distance",
      description:
        "Based on proximity of enhancer and gene. Supports hg38 and hg19 for all tissues.",
      image: "/static/distance.png",
    },
    {
      name: "Chromatin Loop",
      description:
        "Based on chromatin loop predictions from Peakachu which uses genome-wide contact maps from Hi-C datasets.",
      image: "/static/chromatinloop.png",
    },
    {
      name: "eQTL",
      description: "Based on genetic variants associated with gene expression.",
      image: "/static/eqtl.png",
    },
    {
      name: "Activity by Contact",
      description:
        "Based on enhancer activity and enhancer-promoter contact frequency. Only supports hg19.",
      image: "/static/abc.png",
    },
  ];

  const steps = [
    {
      target: ".upload-step-assembly",
      content: "First, choose an assembly. Currently, only the human species is supported (hg19/GRCh37 and hg38/GRCh38). Only hg19 supports all 4 methods.",
      placement: "top",
    },
    {
      target: ".upload-step-tissue",
      content: "Choose a tissue based on your enhancer data.",
      placement: "top",
    },
    {
      target: ".upload-step-algo",
      content: "Select at least 1 algorithm to run. The algorithm options are limited based on your assembly and tissue selections.",
      placement: "top",
    },
    {
      target: ".upload-step-email",
      content:
        "If an email is provided, the results for this analysis will be sent to your email upon completion." +
        " Results will also be accessible through the website, so the email is entirely optional." +
        " (If you cannot find the email, check the junk folder).",
      placement: "top",
    },
    {
      target: ".upload-step-file",
      content:
        "Upload a .bed or .bed.gz file containing your annotated enhancers. It is recommended that the filename includes" +
          " the tissue selected above, as a warning will be shown if the tissue is not in the filename.",
      placement: "top",
    },
    {
      target: ".upload-step-submit",
      content: "Lastly, submit your enhancers for evaluation. Analysis should only take about a minute.",
      placement: "top",
    },
    {
      target: ".nav-usage",
      content:
        "Click here to learn more about how to use the application.",
      placement: "bottom",
    },
    ...(auth && auth.username
      ? [
          {
            target: ".nav-login",
            content:
              "Since you are logged in, you are able to logout or view your results stored in the cloud.",
            placement: "bottom",
          },
        ]
      : [
          {
            target: ".nav-login",
            content:
              "If you create an account and login, all results will be stored in the cloud, accessible on any browser or any device upon login.",
            placement: "bottom",
          },
        ]),
    {
      target: ".nav-history",
      content:
        "Alternatively, if you do not want to create an account, the results from all previous analysis will be stored" +
        " in the local history. Note: The results will only be accessible when using the same browser on the same device!",
      placement: "bottom",
    },
  ];

  const intro = `Welcome to Enhancer Genie, your gateway to unveiling the intricate dance `+
  `between enhancers and genes. At Enhancer Genie, we empower researchers, clinicians, and `+
  `biotech innovators with the tools to navigate the complexities of genetic regulation, `+
  `unlocking potential breakthroughs in therapy and understanding of human biology.\n\n`+
  `**Harness the Power of Advanced Genetic Insights**\n\n`+
  `Enhancer Genie offers a comprehensive suite of analytical tools designed to illuminate `+
  `the interactions that drive gene expression:\n\n`+
  `### 1. **Spatial Analysis for Interaction Prediction**\n\n`+
  `Our spatial analysis feature employs sophisticated algorithms to predict enhancer-gene `+
  `interactions based on their proximity within the genome. This powerful approach allows you `+
  `to visualize the network of potential interactions, aiding in the identification of promising `+
  `research and therapeutic targets. Navigate the genomic landscape with ease, pinpointing `+
  `interactions with precision and confidence.\n\n`+
  `### 2. **Cutting-Edge Supervised Learning for Enhanced Accuracy**\n\n`+
  `Step into the future of genetic research with our advanced supervised learning model. `+
  `Built on a foundation of verified enhancer-gene interactions, this algorithm goes beyond `+
  `the basics to offer precise predictions about the influence of enhancers on specific genes. `+
  `By integrating and analyzing complex data sets, our model sheds light on the subtleties of `+
  `gene regulation, providing insights that drive forward the frontiers of science and medicine.\n\n`+
  `**Empower Your Research with Enhancer Genie**\n\n`+
  `Enhancer Genie is not just a platform; it's a revolution in the way we understand and manipulate `+
  `the genetic code. We're committed to providing the scientific community with the tools needed to `+
  `explore genetic regulation in unprecedented detail. Whether your goal is to decipher the fundamental `+
  `principles of gene expression or to pioneer novel therapeutic strategies, Enhancer Genie is your `+
  `partner in discovery.\n\n`+
  `**Discover the Possibilities with Enhancer Genie**, and embark on a journey to decode the mysteries `+
  `of genetics. Innovate, explore, and transform the future of health and biology. Join us, and let's `+
  `unlock the secrets of the genome together.`;

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem("isFirstVisit", "false");
    }
  };

  return (
    <>
      <Joyride
        continuous
        run={run}
        steps={steps}
        callback={handleJoyrideCallback}
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 100000,
          },
        }}
      />

      <Flex
        minHeight="60vh"
        paddingBottom="20px"
        paddingLeft="50px"
        paddingRight="50px"
        pt="15px"
        direction={{ base: "column", md: "row" }}
        align="stretch"
        justify="center"
      >
        <Box
          width={{ base: "100%", md: "50%" }}
          paddingX="40px"
          // paddingY="0px"
          display="flex"
          paddingTop={"10px"}
          flexDirection="column"
          alignItems="center"
          overflowY="auto" 
        >
          {/* <Text
            textAlign="center"
            fontSize="md"
            color="blue.700"
            my="10px"
            paddingX={"25px"}
          >
            Provide enhancers, and Enhancer Genie will match them to their
            target gene using 4 different methods. Use the generated charts to
            determine which method is the best fit for your enhancer data.
          </Text> */}

          <Accordion allowToggle width="90%">
            <AccordionItem>
              <h1>
              <AccordionButton>
                <Box
                  flex="1"
                  textAlign="left"
                  fontSize={"lg"}
                  fontWeight={"bold"}
                  color="blue.700"
                >
                  About Our Application
                </Box>
                <AccordionIcon />
              </AccordionButton>
              </h1>
              <AccordionPanel pb={4} maxHeight="200px" overflowY="auto">
                <Text fontSize="14" whiteSpace="pre-wrap">
                  {intro}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <br/>
          <Text
            textAlign="center"
            my="10px"
            fontSize="xl"
            fontWeight={"bold"}
            color="blue.700"
          >
            Get enhancer-gene links & view charts for these methods:
          </Text>

          <Accordion width="90%" defaultIndex={[0]}>
            {methods.map((method, index) => (
              <AccordionItem key={index}>
                <AccordionButton>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontSize={"lg"}
                    fontWeight={"bold"}
                    color="blue.700"
                  >
                    {method.name}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text>{method.description}</Text>
                  {method.image ? (
                    <Box display="block" width="100%" paddingTop="10px">
                      <Image
                        src={method.image}
                        alt={`Image for ${method.name}`}
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  ) : (
                    <></>
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        <Flex
          width={{ base: "100%", md: "50%" }}
          justifyContent="center"
          alignItems="center"
        >
          <UploadForm />
        </Flex>
      </Flex>
    </>
  );
};

export default NewHome;
