import Button from "@renderer/Layout/Button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AuthCode from "react-auth-code-input";
import QRCode from "react-qr-code";
import {
  enableTwoFA,
  getTwoFAQrCodeUrl,
  getTwoFAStatus,
  disable2FA as disable2FAAuth
} from "@renderer/lib/user";

export default function TwoFa(): JSX.Element {
  const [is2faEnabled, setIs2faEnabled] = useState<boolean>(false);
  const [twoFACode, setTwoFACode] = useState<string>();
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");

  function handleAuthCodeState(res: string): void {
    setTwoFACode(res);
  }

  async function disable2FA(): Promise<void> {
    if (!confirm("Are you sure you want to disable 2FA?")) {
      return;
    }
    const response = await disable2FAAuth();
    if (response) {
      setIs2faEnabled(false);
    }
  }

  async function enable2FA(): Promise<void> {
    if (twoFACode?.length !== 6) {
      return;
    }

    const response = await enableTwoFA(secret, twoFACode);
    if (response) {
      setIs2faEnabled(true);
    }
  }

  async function getQrCode(): Promise<void> {
    const res = await getTwoFAStatus();
    if (!res) {
      setIs2faEnabled(true);
    } else {
      const response = await getTwoFAQrCodeUrl();
      if (response.status === 200) {
        setQrCode(response.data.url.toString().split("=")[1]);
        setSecret(response.data.url);
      }
    }
  }

  useEffect(() => {
    getQrCode();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{ opacity: 0 }}
      key="2fa"
      className="flex-1 flex flex-col gap-16 items-center justify-center"
    >
      {is2faEnabled ? (
        <>
          <p className="font-poppins text-gray-400 text-2xl">2FA is Enabled!</p>
          <Button theme="default" onClick={disable2FA}>
            Disable
          </Button>
        </>
      ) : (
        <>
          <ul className="font-poppins text-gray-400 text-2xl list-disc">
            <p>Follow these steps:</p>
            <li>Install any auth app (eg. Google Authenticator)</li>
            <li>Scan the QR code</li>
            <li>Enter the 6 digit code below</li>
          </ul>
          <QRCode
            value={qrCode}
            className="p-2 border-2 rounded-lg shadow-darkMain bg-gray-200 border-bgLighter"
          />
          <AuthCode
            onChange={handleAuthCodeState}
            allowedCharacters="numeric"
            containerClassName="flex items-center justify-center gap-4"
            inputClassName="w-8 h-10 bg-transparent border-2 border-bgLighter rounded-lg text-3xl text-center shadow-darkMain text-gray-400"
          />
          <Button theme="default" onClick={enable2FA}>
            Enable
          </Button>
        </>
      )}
    </motion.div>
  );
}
