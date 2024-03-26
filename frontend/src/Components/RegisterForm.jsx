import React, { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const userRef = useRef();
  const passwordRef = useRef();
  const errorRef = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
  });
  
  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrorMsg("");
  }, [username, password]);

  useEffect(() => {
    setPasswordValidations(validatePassword(password));
  }, [password]);
  
  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    };
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const handleSubmit = async (e) => {
    setSubmitLoading(true);
    e.preventDefault();

    const validations = validatePassword(password);
    const allValid = Object.values(validations).every(Boolean);

    if (!allValid) {
      setErrorMsg("Password does not meet all requirements.");
      setSubmitLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "/api/register",
        JSON.stringify({ username, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setSubmitLoading(false);
      console.log(JSON.stringify(response.data));
      setUsername("");
      setPassword("");
      setSuccess(true);
      toast({
        title: "Registration successful!",
        description: "You will be redirected to the login page.",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top",
      });

      navigate("/login");
    } catch (err) {
        setSubmitLoading(false);
      if (!err?.response?.status === 500) {
        setErrorMsg("Failed to register user");
      } else if (err.response?.status === 400) {
        setErrorMsg("Username already exists");
      } else if (err.response?.status === 401) {
        setErrorMsg("Missing username or password");
      } else {
        setErrorMsg("Login Failed");
      }
    }
  };

  return (
    <Flex direction="column" align="center" style={{ minHeight: "100vh" }}>
      <Flex
        direction="column"
        my="50px"
        width="400px"
        style={{
          border: "1px solid gray",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        {success && (
          <Box mb="4" bgColor="green.200" p="3" borderRadius="md">
            Registration successful! Redirecting...
          </Box>
        )}
        {errorMsg && (
          <Alert ref={errorRef} status="error" mb="4" borderRadius="md">
            {errorMsg}
          </Alert>
        )}
        <Text fontSize="2xl" textAlign="center" fontWeight="bold">
          Register
        </Text>

        <FormControl>
          <FormLabel mt="10px">Username:</FormLabel>
          <Input
            type="text"
            ref={userRef}
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            required
          />

          <FormLabel mt="10px">Password:</FormLabel>
          <InputGroup>
            <Input
              type={passwordVisible ? 'text' : 'password'}
              ref={passwordRef}
              onFocus={() => setShowCriteria(true)}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              pr="4rem"
            />
            <InputRightElement width="4rem">
              <IconButton
                h="1.5rem"
                size="sm"
                onClick={togglePasswordVisibility}
                icon={passwordVisible ? <ViewOffIcon /> : <ViewIcon />}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              />
            </InputRightElement>
          </InputGroup>
          {showCriteria && (
            <Flex direction="column" align="start" mt="2">
              <Text color={passwordValidations.number ? "green" : "red"} style={{ fontSize: '12px' }}>
                {passwordValidations.number ? "✓" : "✗"} Contains one number
              </Text>
              <Text color={passwordValidations.lowercase ? "green" : "red"} style={{ fontSize: '12px' }}>
                {passwordValidations.lowercase ? "✓" : "✗"} Contains one lowercase letter
              </Text>
              <Text color={passwordValidations.uppercase ? "green" : "red"} style={{ fontSize: '12px' }}>
                {passwordValidations.uppercase ? "✓" : "✗"} Contains one uppercase letter
              </Text>
              <Text color={passwordValidations.length ? "green" : "red"} style={{ fontSize: '12px' }}>
                {passwordValidations.length ? "✓" : "✗"} At least 8 characters
              </Text>
            </Flex>
          )}

          <Flex width="100%" justifyContent="center">
            <Button
              mt="20px"
              onClick={handleSubmit}
              bg="blue.900"
              color="white"
              alignSelf="center"
              _hover={{
                backgroundColor: "blue.100",
                color: "blue.900",
              }}
              isLoading={submitLoading}
            >
              Sign Up
            </Button>
          </Flex>
        </FormControl>
      </Flex>
    </Flex>
  );
};

export default RegisterForm;
