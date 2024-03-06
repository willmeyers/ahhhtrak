const API_BASE_URL = `localhost:8080`; // TODO (willmeyers): use process.env to ref api url

export const executeSearch = async ({
  event,
}: {
  event: {
    originCode: string;
    destinationCode: string;
    days: string;
  };
}) => {
  const response = await fetch(`http://${API_BASE_URL}/search:execute`, {
    method: "POST",
    body: JSON.stringify(event),
  });

  const paylaod = await response.json();

  return paylaod;
};

export const searchResults = async ({ taskID }: { taskID: number }) => {
  const ws = new WebSocket(
    `ws://${API_BASE_URL}/search:results?taskID=${taskID}`,
  );

  return ws;
  // TODO (willmeyers): listen on new websocket connection and yield results
};
