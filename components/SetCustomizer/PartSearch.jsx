import React, { useState } from 'react';
import axios from 'axios';
import styles from './SetCustomizer.module.scss';

const PartSearch = ({ setCustomParts }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const searchParts = async () => {
        try {
            const response = await axios.get(`https://rebrickable.com/api/v3/lego/parts/`, {
                headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` },
                params: { search: searchQuery }
            });
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Error searching parts:', error);
        }
    };

    const addPart = (part) => {
        setCustomParts((prevParts) => [...prevParts, { ...part, quantity: 1 }]);
    };

    return (
        <div>
            <h3>Search for New Parts</h3>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LEGO Parts"
                    className={styles.input}
                />
                <button onClick={searchParts} className={styles.button}>
                    Search
                </button>
            </div>
            <ul className={styles.partList}>
                {searchResults.map((part) => (
                    <li key={part.part_num} className={styles.partItem}>
                        {part.name} - {part.part_num}
                        <button onClick={() => addPart(part)} className={styles.addButton}>
                            Add
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PartSearch;