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
    await searchResults({ taskID: p.taskID });
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
