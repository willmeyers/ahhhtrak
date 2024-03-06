import "./App.css";
import { executeSearch, searchResults } from "./api";
import { SearchBar } from "./components/SearchBar";

function App() {
  const handleSubmit = async (values: {
    originCode: string;
    destinationCode: string;
    days: string;
  }) => {
    const p = await executeSearch({ event: values });
    const ws = await searchResults({ taskID: p.taskID });

    ws.addEventListener("open", (event) => console.log("open", event));
    ws.addEventListener("message", (event) => console.log("msg", event));
    ws.addEventListener("close", (event) => console.log("close", event));
  };

  return (
    <main className="flex h-screen flex-col">
      <div className="flex place-self-center py-32">
        <SearchBar onSubmit={handleSubmit} />
      </div>
    </main>
  );
}

export default App;
