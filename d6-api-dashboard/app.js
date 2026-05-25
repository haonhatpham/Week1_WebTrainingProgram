const endpoints = [
  {
    id: "weather",
    url: "https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&current=temperature_2m,wind_speed_10m",
    parse(data) {
      return [
        ["Temperature", `${data.current.temperature_2m} ${data.current_units.temperature_2m}`],
        ["Wind speed", `${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`],
        ["Updated", data.current.time],
      ];
    },
  },
  {
    id: "github",
    url: "https://api.github.com/repos/vercel/next.js",
    parse(data) {
      return [
        ["Stars", data.stargazers_count.toLocaleString()],
        ["Open issues", data.open_issues_count.toLocaleString()],
        ["Default branch", data.default_branch],
      ];
    },
  },
  {
    id: "posts",
    url: "https://jsonplaceholder.typicode.com/posts?_limit=3",
    parse(data) {
      return data.map((post, index) => [`Post ${index + 1}`, post.title]);
    },
  },
];

const refreshButton = document.querySelector("[data-action='refresh']");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(url, maxAttempts = 3, baseDelay = 500) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(baseDelay * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError;
}

function getCard(endpointId) {
  return document.querySelector(`[data-card="${endpointId}"]`);
}

function clearNode(node) {
  node.replaceChildren();
}

function renderSkeleton(endpointId) {
  const body = getCard(endpointId).querySelector("[data-body]");
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 3; index += 1) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";
    fragment.append(skeleton);
  }

  body.replaceChildren(fragment);
}

function buildMetric(label, value) {
  const metric = document.createElement("div");
  const labelNode = document.createElement("span");
  const valueNode = document.createElement("strong");

  metric.className = "metric";
  labelNode.textContent = label;
  valueNode.textContent = value;
  valueNode.title = value;

  metric.append(labelNode, valueNode);
  return metric;
}

function renderSuccess(endpointId, metrics) {
  const body = getCard(endpointId).querySelector("[data-body]");
  const fragment = document.createDocumentFragment();

  metrics.forEach(([label, value]) => {
    fragment.append(buildMetric(label, value));
  });

  body.replaceChildren(fragment);
}

function renderError(endpointId, error) {
  const body = getCard(endpointId).querySelector("[data-body]");
  const message = document.createElement("p");

  clearNode(body);
  message.className = "status-error";
  message.textContent = `Could not load this section after 3 attempts. ${error.message}`;
  body.append(message);
}

async function loadDashboard() {
  refreshButton.disabled = true;

  endpoints.forEach((endpoint) => {
    renderSkeleton(endpoint.id);
  });

  const requests = endpoints.map(async (endpoint) => {
    try {
      const data = await fetchWithRetry(endpoint.url, 3, 500);
      const metrics = endpoint.parse(data);

      renderSuccess(endpoint.id, metrics);

      return {
        id: endpoint.id,
        status: "loaded",
      };
    } catch (error) {
      renderError(endpoint.id, error);
      throw error;
    }
  });

  await Promise.allSettled(requests);

  refreshButton.disabled = false;
}

refreshButton.addEventListener("click", loadDashboard);

loadDashboard();
