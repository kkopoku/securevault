import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";

export default function Home() {
  const [secureText, setSecureText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [lifetime, setLifetime] = useState(null);
  const [viewNumber, setViewNumber] = useState("1");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState("normal");
  const [link, setLink] = useState("");

  const API = process.env.REACT_APP_API_URL;
  const oneHour = 1000 * 60 * 60;

  let { id } = useParams();
  id = id ?? "";

  const url = process.env.REACT_APP_URL;

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

  async function createLink() {
    // TO DO: validate inputs
    if (!secureText) return alert("Please enter a message");
    const data = {
      message: secureText,
      lifetime: lifetime ?? oneHour,
      viewNumber: viewNumber ?? 1,
      passphrase: passphrase ?? null,
    };
    const requestOptions = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    let response = await fetch(API + "api/v1/link/createLink", requestOptions);
    response = await response.json();
    setLink(response.link.link);
  }

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
          setPageState("NotFound");
        } else if (response.status == 400) {
          setPageState("Unauthorized");
        } else if (response.status == 200) {
          setPageState("Viewing");
          response = await response.json();
          setSecureText(response.message);
        }
        setLoading(false);
      } catch (e) {
        // alert("An Error occured, please try again");
        console.log(e);
        setLoading(false);
      }
    } else {
      setPageState("Normal");
      setLoading(false);
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

      <div className="flex flex-col w-full items-center pt-20 gap-10">
        <h2 className="w-2/3 lg:w-1/2 font-semibold">
          Paste a password, secret message or private link below. Keep sensitive
          info out of your email and chat logs.
        </h2>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Message */}
            <textarea
              className="border min-h-48 w-2/3 lg:w-1/2 placeholder:px-3 p-3 focus:outline-green-500"
              id="securetext"
              type="text"
              disabled={pageState !== "Normal"}
              value={secureText}
              placeholder="Type Secret Content Here ..."
              onChange={(e) => setSecureText(e.target.value)}
            />

            <div className="flex flex-col gap-2 border w-2/3 lg:w-1/2 items-start p-3">
              <div className="font-bold">Privacy Options</div>

              {/* PassPhrase */}
              <div className="flex flex-row w-full">
                <label
                  htmlFor="passphrase"
                  className="flex w-28 bg-slate-300 pl-1"
                >
                  Passphrase
                </label>
                <input
                  className="border w-full px-2 focus:outline-none"
                  id="passphrase"
                  type="text"
                  disabled={pageState !== "Normal"}
                  value={passphrase}
                  placeholder="Type Your Passphrase Here ..."
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>

              {/* LifeTime */}
              <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-5 lg:gap-10">
                <div className="flex basis-1/2">
                  <label
                    htmlFor="lifetime"
                    className="flex w-28 bg-slate-300 pl-1"
                  >
                    Lifetime
                  </label>
                  <select
                    className="border w-full px-2 focus:outline-none"
                    id="lifetime"
                    type="text"
                    disabled={pageState !== "Normal"}
                    placeholder="Type Your Passphrase Here ..."
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

                {/* View Number */}
                <div className="flex basis-1/2">
                  <label
                    htmlFor="viewnumber"
                    className="flex w-28 bg-slate-300 pl-1"
                  >
                    View No
                  </label>
                  <select
                    className="border w-full px-2 focus:outline-none"
                    id="viewnumber"
                    type="text"
                    disabled={pageState !== "Normal"}
                    placeholder="Type Your Passphrase Here ..."
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
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    alert("Link copied successfully");
                  }}
                  className="p-2 w-2/3 lg:w-1/2 bg-slate-100 rounded-lg"
                >
                  {`Link Created: ${link}`}
                </button>
              </>
            ) : (
              <button
                className="p-2 text-sm w-2/3 lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105"
                onClick={createLink}
              >
                Create Secret Link
              </button>
            )}
          </>
        )}

        <div className="w-2/3 lg:w-1/2 font-semibold">
          NB: A secret link only works once and then disappears forever. Data is
          erased after link is accessed or expired.
        </div>
      </div>
    </div>
  );
}
