import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"

export default function Home() {
  const [secureText, setSecureText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [lifetime, setLifetime] = useState(null);
  const [viewNumber, setViewNumber] = useState("1");
  const [loading, setLoading] = useState(true);
  const [pageState, setPageState] = useState("Normal");
  const [link, setLink] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pageStatus, setPageStatus] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API = process.env.REACT_APP_API_URL;
  const oneHour = 1000 * 60 * 60;

  let { id } = useParams();
  id = id ?? "";

  const url = window.location.origin + "/";

  const lifetimeOptions = [
    { name: "5 mins", value: 1000 * 60 * 5 },
    { name: "20 mins", value: 1000 * 60 * 20 },
    { name: "30 mins", value: 1000 * 60 * 30 },
    { name: "1 hr", value: 1000 * 60 * 60 },
    { name: "1 day", value: 1000 * 60 * 60 * 24 },
  ];

  const viewNumberOptions = [
    { value: "1" },
    { value: "2" },
    { value: "3" },
    { value: "4" },
    { value: "5" },
  ];

  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  function goToInitialPage() {
    window.location.pathname = "/";
    setSecureText("");
    setPassphrase("");
    setLifetime(null);
    setViewNumber("1");
    setPageState("Normal");
    setLink("");
    setPageStatus("");
  }

  async function createLink() {
    if (!secureText) return toast.error("Please enter a message");

    if(recipient){
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) return toast.error("Please enter a valid email address");
    }

    const data = {
      message: secureText,
      lifetime: lifetime ?? oneHour,
      viewNumber: viewNumber ?? 1,
      passphrase: passphrase ?? null,
      recipient: recipient ?? null,
    };
    setLoading(true);
    const toastId = toast.loading("creating link");
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      let response = await fetch(
        API + "api/v1/link/createLink",
        requestOptions
      );
      response = await response.json();
      toast.success("Link created", { id: toastId });
      setLink(response.link.link);
    } catch (e) {
      toast.error("An error occurred, please try again later", { id: toastId });
      console.log("Error: " + e.message);
    }
    setLoading(false);
  }

  const LoadingWidget = () => {
    return (
      <div className="animate-pulse flex space-x-4 w-full lg:w-1/2 justify-center items-center">
        <div className="flex-1 w-full space-y-6 py-1">
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 w-1/2 rounded"></div>
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-48 bg-slate-200 rounded col-span-3"></div>
            </div>
            <div className="flex flex-col h-28 bg-transparent rounded border gap-3 justify-center items-center px-5">
              <div className="flex w-full h-5 bg-slate-200 rounded"></div>
              <div className="flex w-full h-5 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  async function checkPageState() {
    if (window.location.href !== url) {
      setPageState("Viewing");

      const getLinkQueryParams = {
        id: id,
        passphrase: passphrase ?? null,
      };

      const getLinkUrl = new URL(API + "api/v1/link/getLinkDetails");
      getLinkUrl.search = new URLSearchParams(getLinkQueryParams).toString();

      try {
        setLoading(true);
        let response = await fetch(getLinkUrl, {
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });

        if (response.status == 404) {
          setPageStatus("NotFound");
        } else if (response.status == 401) {
          setPageStatus("Unauthorized");
        } else if (response.status == 200) {
          setPageStatus("MessageReceived");
          response = await response.json();
          setSecureText(response.message);
        } else {
          setPageStatus("UnexpectedError");
        }
        setLoading(false);
      } catch (e) {
        setPageStatus("UnexpectedError");
        console.log(`Error: ${e}`);
        setLoading(false);
      }
    } else {
      setPageState("Normal");
      setLoading(false);
    }
  }

  async function submitPassphrase() {
    if (!passphrase) {
      setErrorMessage("Please enter a passphrase")
      return toast("Passphrase is required", {icon:"🚫"})
    }
    const getLinkQueryParams = {
      id: id,
      passphrase: passphrase,
    };

    const getLinkUrl = new URL(API + "api/v1/link/getLinkDetails");
    getLinkUrl.search = new URLSearchParams(getLinkQueryParams).toString();

    try {
      let id = toast.loading("Checking passphrase...");
      let response = await fetch(getLinkUrl, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        toast.error("wrong passphrase man", { id: id });
        setErrorMessage("Incorrect passphrase, please try again")
      } else if (response.status === 200) {
        response = await response.json();
        toast.success("message retrieved 😉", { id: id });
        setPageStatus("MessageReceived");
        setSecureText(response.message);
      } else {
        setErrorMessage("Something went wrong, kindly try again later")
        toast.error("an error occurred please try again", { id: id });
      }
    } catch (e) {
      toast.error("an error occurred please try again", { id: id });
      setErrorMessage("Something went wrong, kindly try again later")
      console.log(e);
    }
  }

  useEffect(() => {
    checkPageState();
  }, []);

  return (
    <div className="min-h-screen w-full">
      
      <div className="flex flex-row bg-blue-700 w-full py-1 justify-center text-white font-bold text-lg">
        <span className="text-green-500">Secure</span>Vault
      </div>

      <Toaster />

      {/* CREATING SECURE LINK STAGE */}
      {pageState === "Normal" && (
        <div className="flex flex-col w-full items-center min-h-screen justify-center gap-10 px-4">
          {/* Message */}
          <h2 className="w-full lg:w-1/2 font-semibold">
            Input confidential information and create a secure link for private
            access. Avoid storing sensitive data in email or chat logs.
          </h2>
          <textarea
            className={`min-h-48 w-full border ${link || loading ? 'bg-slate-100' : 'bg-white'} rounded border-blue-600 lg:w-1/2 placeholder:px-3 p-3`}
            id="securetext"
            type="text"
            disabled={link || loading}
            value={secureText}
            placeholder="Type Secret Content Here ..."
            onChange={(e) => setSecureText(e.target.value)}
          />

          {/* Privacy Options */}
          <div className="grid grid-cols-2 gap-2 border bg-blue-50 bg-opacity-70 rounded border-slate-400 w-full lg:w-1/2 items-start p-3">
            <div className="col-span-2 font-bold">Privacy Options</div>

            <div className="col-span-2 flex flex-col gap-3 w-full">

              {/* PassPhrase */}
              <div className=" flex flex-col w-full">
                <label htmlFor="passphrase" className="flex text-xs font-normal">
                  PASSPHRASE (OPTIONAL)
                </label>
                <div className="relative">
                <input
                  className={`border ${
                    loading || link ? "bg-slate-200" : "bg-white"
                  } w-full px-2 focus:outline-none border-green-600 rounded`}
                  id="passphrase"
                  type={showPassword ? "text" : "password"}
                  disabled={link || loading}
                  value={passphrase}
                  placeholder="Type Your Passphrase Here ..."
                  onChange={(e) => setPassphrase(e.target.value)}
                />
                <span onClick={toggleShowPassword} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer">{showPassword ? '🐵' : '🙈'}</span>
                </div>
              </div>

              {/* Lifetime */}

              <div className="flex flex-col basis-1/2">
                <label htmlFor="lifetime" className="flex text-xs font-normal">
                  LIFETIME <span className="text-red-700">&nbsp; *</span>
                </label>
                <select
                  className={`border ${
                    loading || link ? "bg-slate-200" : "bg-white"
                  } w-full px-2 focus:outline-none border-green-600 rounded`}
                  id="lifetime"
                  type="text"
                  disabled={link || loading}
                  value={lifetime ?? ""}
                  onChange={(e) => setLifetime(e.target.value)}
                >
                  {lifetimeOptions.map((item) => {
                    return (
                      <option key={item.name} value={item.value}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* ViewNumber */}
              <div className="flex flex-col basis-1/2">
                <label htmlFor="viewnumber" className="flex text-xs font-normal">
                  VIEW NUMBER <span className="text-red-700">&nbsp; *</span>
                </label>
                <select
                  className={`border ${
                    loading || link ? "bg-slate-200" : "bg-white"
                  } w-full px-2 focus:outline-none border-green-600 rounded`}
                  id="viewnumber"
                  type="text"
                  disabled={link || loading}
                  value={viewNumber}
                  onChange={(e) => setViewNumber(e.target.value)}
                >
                  {viewNumberOptions.map((item) => {
                    return <option key={item.value}>{item.value}</option>;
                  })}
                </select>
              </div>

              {<div className=" flex flex-col w-full">
                <label htmlFor="recipient" className="flex text-xs font-normal">
                  RECIPIENT EMAIL (OPTIONAL)
                </label>
                <div className="relative">
                <input
                  className={`border ${
                    loading || link ? "bg-slate-200" : "bg-white"
                  } w-full px-2 focus:outline-none border-green-600 rounded`}
                  id="recipient"
                  type="text"
                  disabled={link || loading}
                  value={recipient}
                  placeholder="Type Recipient Email Here ..."
                  onChange={(e) => setRecipient(e.target.value)}
                />
                </div>
              </div>}

            </div>
          </div>

          {link ? (
            <div className="flex flex-col w-full gap-1 lg:gap-3 items-center justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied successfully");
                }}
                className="p-2 w-full lg:w-1/2 bg-slate-100 rounded-lg"
              >
                {`Link Created: ${link}`}
              </button>
              <button
                onClick={goToInitialPage}
                className="p-2 text-sm w-full lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all"
              >
                Generate new link
              </button>
            </div>
          ) : (
            <button
              className="p-2 text-sm text-white w-full lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all"
              onClick={createLink}
              disabled={link || loading}
            >
              Create Secure Link
            </button>
          )}
          <div className="w-full lg:w-1/2 font-semibold">
            NB: A secure link only works for the number of views specified on creation and disappears forever. Data
            is erased after link is accessed or expired.
          </div>
        </div>
      )}

      {pageState === "Viewing" && (

        <div className="flex flex-col min-h-screen justify-center items-center gap-10 px-4">

          {loading && <LoadingWidget />}

          {/* UNAUTHORIZED */}
          {pageStatus === "Unauthorized" && (
            <form className="flex flex-col w-full lg:w-1/2 gap-3 items-center">
              <label htmlFor="confirmPassphrase" className="text-xl font-bold">
                Enter Passphrase To Unlock Secret Message
              </label>
              <div className="w-full relative">
              <input
                className="w-full p-2 rounded border-2 border-black"
                value={passphrase}
                type={showPassword ? "text" : "password"}
                placeholder="Enter passphrase here ..."
                onChange={(e) => {
                  setPassphrase(e.target.value)
                  setErrorMessage("");
                }}
                onSubmit={(e) => {
                  e.preventDefault()
                  submitPassphrase()
                }}
                id="confirmPassphrase"
              />
              <span onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer">{showPassword ? '🐵' : '🙈'}
              </span>
              </div>
              <button
                className="p-2 text-white text-sm w-full bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all"
                onClick={(e) => {
                  e.preventDefault()
                  submitPassphrase()
                }}
              >
                View Message
              </button>
              {errorMessage && (<span className="text-red-500">{errorMessage}</span>)}
            </form>
          )}

          {/* MESSAGE RECEIVED */}
          {pageStatus === "MessageReceived" && (
            <div className="flex flex-col w-full lg:w-1/2 gap-3 items-center">
              <label htmlFor="receivedMessage" className="text-2xl font-bold">
                Secret Message
              </label>
              <textarea
                className="min-h-48 w-full border bg-slate-200 rounded border-slate-300 placeholder:px-3 p-3 focus:border-none"
                value={secureText}
                id="receivedMessage"
                readOnly
              />

              <button
                onClick={goToInitialPage}
                className="p-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105 w-full"
              >
                Generate new link
              </button>
            </div>
          )}

          {/* NOT FOUND */}
          {pageStatus === "NotFound" && (
            <div className="flex flex-col gap-10 w-4/5 lg:w-1/2 items-center text-3xl font-bold">
              <div>NOT FOUND ...</div><button
                onClick={goToInitialPage}
                className="p-2 text-sm text-white w-full lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all animate-bounce"
              >
                Click Here to send secure message
              </button>
            </div>
          )}

          {/* UNEXPECTED ERROR */}
          {pageStatus === "UnexpectedError" && (
            <div className="flex flex-col w-4/5 lg:w-1/2 gap-3 items-center text-3xl font-bold">
              SOMETHING WENT WRONG PLEASE TRY AGAIN
            </div>
          )}

          {/* <div>Loading and this is the pageState: {pageStatus}</div> */}
        </div>
      )}
      <Analytics />
    </div>
  );
}
