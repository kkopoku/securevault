import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

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

  function goToInitialPage(){
    window.location.pathname = '/';
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
    const data = {
      message: secureText,
      lifetime: lifetime ?? oneHour,
      viewNumber: viewNumber ?? 1,
      passphrase: passphrase ?? null,
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
      toast.error("An error occured, please try again later", { id: toastId });
      console.log("Error: " + e.message);
    }
    setLoading(false);
  }

  const LoadingWidget = () => {
    return (
      <div className="animate-pulse flex space-x-4 w-4/5 lg:w-1/2 justify-center items-center">
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
      if (response.status === 401){
        toast.error("wrong passphrase man", {id: id});
      } else if (response.status === 200){
        response = await response.json();
        toast.success("you know ball 😉", {id: id});
        setPageStatus("MessageReceived");
        setSecureText(response.message)
      }else{
        toast.error("an error occured please try again", {id: id});
      }
    }catch(e) {
      toast.error("an error occured please try again", {id: id});
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
        <div className="flex flex-col w-full min-h-screen items-center justify-center gap-10">
          {/* Message */}
          <h2 className="w-4/5 lg:w-1/2 font-semibold">
            Paste a password, secret message or private link below. Keep
            sensitive info out of your email and chat logs.
          </h2>
          <textarea
            className="border min-h-48 w-4/5 lg:w-1/2 placeholder:px-3 p-3 focus:outline-green-500"
            id="securetext"
            type="text"
            disabled={link || loading}
            value={secureText}
            placeholder="Type Secret Content Here ..."
            onChange={(e) => setSecureText(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2 border w-4/5 lg:w-1/2 items-start p-3">
            <div className="col-span-2 font-bold">Privacy Options</div>

            {/* PassPhrase */}
            <div className="col-span-2 flex flex-row w-full">
              <label
                htmlFor="passphrase"
                className="flex rounded-none w-28 bg-slate-300 pl-1"
              >
                Passphrase
              </label>
              <input
                className={`border ${ (loading || link) ? 'bg-slate-200' : 'bg-white' }rounded-none w-full px-2 focus:outline-none`}
                id="passphrase"
                type="text"
                disabled={link || loading}
                value={passphrase}
                placeholder="(Optional) Type Your Passphrase Here ..."
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>

            {/* Lifetime */}
            <div className="col-span-2">
              <div className="flex basis-1/2">
                <label
                  htmlFor="lifetime"
                  className="flex rounded-none w-28 bg-slate-300 pl-1"
                >
                  Lifetime
                </label>
                <select
                  className={`border ${ (loading || link) ? 'bg-slate-200' : 'bg-white' } rounded-none w-full px-2 focus:outline-none`}
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
            </div>

            {/* ViewNumber */}
            <div className="col-span-2">
              <div className="flex basis-1/2">
                <label
                  htmlFor="viewnumber"
                  className="flex w-28 rounded-none bg-slate-300 pl-1"
                >
                  View No
                </label>
                <select
                  className={`border ${ (loading || link) ? 'bg-slate-200' : 'bg-white' } w-full rounded-none px-2 focus:outline-none`}
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
            </div>
          </div>

          {link ? (
            <div className="flex flex-col w-full gap-1 lg:gap-3 items-center justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied successfully");
                }}
                className="p-2 w-4/5 lg:w-1/2 bg-slate-100 rounded-lg"
              >
                {`Link Created: ${link}`}
              </button>
              <button onClick={goToInitialPage} className="p-2 text-sm w-4/5 lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105">
                Generate new link
              </button>
            </div>
          ) : (
            <button
              className="p-2 text-sm w-4/5 lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105"
              onClick={createLink}
              disabled={link || loading}
            >
              Create Secret Link
            </button>
          )}
          <div className="w-4/5 lg:w-1/2 font-semibold">
            NB: A secret link only works once and then disappears forever. Data
            is erased after link is accessed or expired.
          </div>
        </div>
      )}

      {pageState === "Viewing" && (
        <div className="flex flex-col min-h-[90vh] justify-center items-center gap-10">
          {loading && <LoadingWidget />}
          {/* UNAUTHORIZED */}
          {pageStatus === "Unauthorized" && (
            <div className="flex flex-col w-4/5 lg:w-1/2 gap-3 items-center">
              <label htmlFor="confirmPassphrase">
                Enter Passphrase To Unlock Secret Message
              </label>
              <input
                className="border w-full px-2 focus:outline-none"
                value={passphrase}
                placeholder="Enter passphrase here ..."
                onChange={(e) => setPassphrase(e.target.value)}
                id="confirmPassphrase"
              />
              {/* {error && <span className="text-red-600 text-xs">Wrong password</span>} */}
              <button
                className="p-2 text-sm bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105"
                onClick={()=>{
                  submitPassphrase()
                }}
              >
                View Message
              </button>
            </div>
          )}

          {/* MESSAGE RECEIVED */}
          {pageStatus === "MessageReceived" && (
            <div className="flex flex-col w-4/5 lg:w-1/2 gap-3 items-center">
              <label htmlFor="receivedMessage" className="text-2xl font-bold">
                Secret Message
              </label>
              <textarea
                className="border min-h-48 w-full p-3 focus:outline-none"
                value={secureText}
                id="receivedMessage"
                readOnly
              />

              <button
                onClick={goToInitialPage}
                className="p-2 text-sm bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105 w-full"
              >
                Generate new link
              </button>
            </div>
          )}

          {/* NOT FOUND */}
          {pageStatus === "NotFound" && (
            <div className="flex flex-col w-4/5 lg:w-1/2 gap-3 items-center">
              NOT FOUND MAN!
            </div>
          )}

          {/* UNEXPECTED ERROR */}
          {pageStatus === "UnexpectedError" && (
            <div className="flex flex-col w-4/5 lg:w-1/2 gap-3 items-center">
              Unexpected Error
            </div>
          )}

          {/* <div>Loading and this is the pageState: {pageStatus}</div> */}
        </div>
      )}
    </div>
  );
}
