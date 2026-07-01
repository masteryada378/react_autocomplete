import React, { useState, useEffect, useRef } from 'react';
import { Person } from '../types/Person';

interface Props {
  people: Person[];
  delay?: number;
  onSelected: (person: Person | null) => void;
}

export const Autocomplete: React.FC<Props> = ({
  people,
  delay = 300,
  onSelected,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '' && query.length > 0) {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownActive(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setQuery(value);
    onSelected(null);
  };

  const handleInputFocus = () => {
    setIsDropdownActive(true);
  };

  const handleSuggestionClick = (person: Person) => {
    setQuery(person.name);
    setDebouncedQuery(person.name);
    setIsDropdownActive(false);
    onSelected(person);
  };

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const suggestions = people.filter(person =>
    person.name.toLowerCase().includes(normalizedQuery),
  );

  const showSuggestions =
    isDropdownActive && (query.length === 0 || suggestions.length > 0);
  const showNoSuggestions =
    isDropdownActive && query.length > 0 && suggestions.length === 0;

  return (
    <div
      className={`dropdown ${showSuggestions ? 'is-active' : ''}`}
      ref={dropdownRef}
    >
      <div className="dropdown-trigger">
        <input
          type="text"
          placeholder="Enter a part of the name"
          className="input"
          data-cy="search-input"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
      </div>

      {showSuggestions && (
        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {suggestions.map(person => (
              <div
                key={person.slug}
                className="dropdown-item"
                data-cy="suggestion-item"
                onClick={() => handleSuggestionClick(person)}
                role="button"
                style={{ cursor: 'pointer' }}
              >
                <p
                  className={
                    person.sex === 'm' ? 'has-text-link' : 'has-text-danger'
                  }
                >
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNoSuggestions && (
        <div
          className="notification is-danger is-light
            mt-3 is-align-self-flex-start"
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">No matching suggestions</p>
        </div>
      )}
    </div>
  );
};
