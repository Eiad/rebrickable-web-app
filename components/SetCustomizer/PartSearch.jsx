import React, { useState } from 'react';
import axios from 'axios';
import styles from '../SetCustomizer/SetCustomizer/SetCustomizer.module.scss';

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
        alert('Part added successfully!');
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
            <div className={styles.partGrid}>
                {searchResults.map((part) => (
                    <div key={part.part_num} className={styles.partCard}>
                        <img src={part.part_img_url} alt={part.name} />
                        <div>
                            <h4>{part.name}</h4>
                            <p>ID: {part.part_num}</p>
                            <button onClick={() => addPart(part)} className={styles.addButton}>
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartSearch;