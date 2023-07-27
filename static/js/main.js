document.addEventListener("DOMContentLoaded", () => {
  const body = JSON.stringify({
    url: document.URL.replace(/^https?:\/\//, ""),
  });
  fetch("https://v6p2mhm7kckq55csda2dbucc3i0whdhc.lambda-url.us-east-1.on.aws/", {
    method: "POST",
    mode: "cors",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });
});
