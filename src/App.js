import { useState } from "react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Tooltip,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import nacl from "tweetnacl";
import { truncateAddress } from "./utils";
import SelectWalletModal from "./Modal";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [provider, setProvider] = useState();
  const [account, setAccount] = useState();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();

  const connectWithProvider = async (provider) => {
    try {
      if (!provider) throw Error("Wallet not found.");
      setProvider(provider);
      await provider.connect();
      if (provider.publicKey) {
        setAccount(provider.publicKey.toString());
      }
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const signMessage = async () => {
    if (!provider) return;
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encodedMessage);
      setSignedMessage(encodedMessage);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!provider) return;
    try {
      const verified = nacl.sign.detached.verify(
        signedMessage,
        signature,
        provider.publicKey.toBuffer()
      );
      setVerified(verified);
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = async () => {
    await provider.disconnect();
    refreshState();
  };

  return (
    <>
      <Text position="absolute" top={0} right="15px">
        If you're in the sandbox, first "Open in New Window"{" "}
        <span role="img" aria-label="up-arrow">
          ⬆️
        </span>
      </Text>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
          >
            Let's connect to
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(15deg, #DC1FFF 0%, #00FFA3 100.00%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Solana
          </Text>
        </HStack>
        <HStack>
          {!account ? (
            <Button onClick={onOpen}>Connect</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          {account ? (
            <Tooltip label={account} placement="right">
              <Text>{`Account: ${truncateAddress(account)}`}</Text>
            </Tooltip>
          ) : (
            <Text>{`Account: No Account`}</Text>
          )}
        </VStack>
        {provider?.publicKey && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={signMessage} isDisabled={!message}>
                  Sign Message
                </Button>
                <Input
                  placeholder="Set Message"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                />
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Message Signed`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={verifyMessage} isDisabled={!signature}>
                  Verify Message
                </Button>
                {verified !== undefined ? (
                  verified === true ? (
                    <VStack>
                      <CheckCircleIcon color="green" />
                      <Text>Signature Verified!</Text>
                    </VStack>
                  ) : (
                    <VStack>
                      <WarningIcon color="red" />
                      <Text>Signature Denied!</Text>
                    </VStack>
                  )
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
      <SelectWalletModal
        isOpen={isOpen}
        closeModal={onClose}
        connectWithProvider={connectWithProvider}
      />
    </>
  );
}
