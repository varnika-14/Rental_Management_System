import React, { useState } from "react";
import API from "../services/api";
import "../styles/property.css";

function NaturalLanguageSearch({ onSearchResults, onClear }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [showTips, setShowTips] = useState(false);

  const exampleSearches = [
    "2BHK apartment near metro station under 25000",
    "Furnished house with parking and garden",
    "PG near IT park for working professionals",
    "Studio apartment with gym and wifi",
    "Villa within 50000 rent with swimming pool",
    "Affordable 1BHK near hospital and school",
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert("Please describe what you're looking for");
      return;
    }

    setIsSearching(true);
    setAiInterpretation("");

    try {
      const response = await API.post("/property/natural-language-search", {
        query: searchQuery,
      });

      if (response.data.success) {
        setAiInterpretation(response.data.aiInterpretation);
        onSearchResults(response.data.properties, response.data.filtersApplied);
      } else {
        onSearchResults(response.data.properties, null);
        setAiInterpretation(response.data.aiInterpretation);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExampleClick = (example) => {
    setSearchQuery(example);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSearch(fakeEvent);
    }, 100);
  };

  const handleClear = () => {
    setSearchQuery("");
    setAiInterpretation("");
    onClear();
  };

  return (
    <div className="nl-search-container">
      <div className="nl-search-header">
        <h3>Natural Language Search</h3>
        <p>Describe what you're looking for in plain English</p>
      </div>

      <form onSubmit={handleSearch} className="nl-search-form">
        <div className="nl-input-wrapper">
          <textarea
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Example: 'Looking for a 2BHK apartment near metro station with parking, budget around 25,000 per month, preferably furnished'"
            rows="3"
            className="nl-textarea"
          />
          <div className="nl-actions">
            <button
              type="submit"
              className="nl-search-btn"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <span className="nl-spinner"></span>
                  AI is thinking...
                </>
              ) : (
                <>🔍 Search with AI</>
              )}
            </button>
            {searchQuery && (
              <button
                type="button"
                className="nl-clear-btn"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {aiInterpretation && (
        <div className="nl-interpretation">
          <div className="nl-interpretation-icon">🤖</div>
          <div className="nl-interpretation-text">
            <strong>AI understands:</strong> {aiInterpretation}
          </div>
        </div>
      )}

      <div className="nl-tips">
        <button
          className="nl-tips-toggle"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? "▼" : "▶"} Example searches
        </button>
        {showTips && (
          <div className="nl-examples">
            {exampleSearches.map((example, index) => (
              <button
                key={index}
                className="nl-example-btn"
                onClick={() => handleExampleClick(example)}
              >
                💡 {example}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NaturalLanguageSearch;
