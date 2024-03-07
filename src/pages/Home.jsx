import React from "react";
import { useState } from "react";

export default function Home() {
  const [secureText, setSecureText] = useState("");
  const [lifetime, setLifetime] = useState("5 mins");
  const [viewNumber, setViewNumber] = useState("1");
  const [loading, setLoading] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);

  const lifetimeOptions = [
    { value: "5 mins" },
    { value: "20 mins" },
    { value: "30 mins" },
    { value: "1 hr" },
    { value: "1 day" },
  ];

  const viewNumberOptions = [
    { value: "1" },
    { value: "2" },
    { value: "3" },
    { value: "4" },
    { value: "5" },
  ];

  function createLink() {
    // make some api call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLinkGenerated(true);
    }, 1000);
  }

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
        <textarea
          className="border min-h-48 w-2/3 lg:w-1/2 placeholder:px-3 p-3 focus:outline-green-500"
          id="securetext"
          type="text"
          value={secureText}
          placeholder="Type Secret Content Here ..."
          onChange={(e) => setSecureText(e.target.value)}
        />

        <div className="flex flex-col gap-2 border w-2/3 lg:w-1/2 items-start p-3">
          <div className="font-bold">Privacy Options</div>

          <div className="flex flex-row w-full">
            <label for="passphrase" className="flex w-28 bg-slate-300 pl-1">
              Passphrase
            </label>
            <input
              className="border w-full px-2 focus:outline-none"
              id="passphrase"
              type="text"
              value={secureText}
              placeholder="Type Your Passphrase Here ..."
              onChange={(e) => setSecureText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-5 lg:gap-10">
            <div className="flex basis-1/2">
              <label for="lifetime" className="flex w-28 bg-slate-300 pl-1">
                Lifetime
              </label>
              <select
                className="border w-full px-2 focus:outline-none"
                id="lifetime"
                type="text"
                placeholder="Type Your Passphrase Here ..."
                value={lifetime}
                onChange={(e) => setLifetime(e.target.value)}
              >
                {lifetimeOptions.map((item) => {
                  return <option>{item.value}</option>;
                })}
              </select>
            </div>

            <div className="flex basis-1/2">
              <label for="viewnumber" className="flex w-28 bg-slate-300 pl-1">
                View No
              </label>
              <select
                className="border w-full px-2 focus:outline-none"
                id="viewnumber"
                type="text"
                placeholder="Type Your Passphrase Here ..."
                value={viewNumber}
                onChange={(e) => setViewNumber(e.target.value)}
              >
                {viewNumberOptions.map((item) => {
                  return <option>{item.value}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {linkGenerated ? (
          <div className="p-2 w-2/3 lg:w-1/2 bg-slate-100 rounded-lg">
            generated link
          </div>
        ) : (
          <button
            className="p-2 text-sm w-2/3 lg:w-1/2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-all hover:scale-105"
            onClick={createLink}
          >
            Create Secret Link
          </button>
        )}

        <div className="w-2/3 lg:w-1/2 font-semibold">
          NB: A secret link only works once and then disappears forever. Data is
          erased after link is accessed or expired.
        </div>
      </div>
    </div>
  );
}
