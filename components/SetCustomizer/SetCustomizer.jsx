import React, { useState } from 'react';
import axios from 'axios';
import PartList from './PartList.jsx';
import PartSearch from './PartSearch.jsx';
import CustomParts from './CustomParts.jsx';
import styles from './SetCustomizer.module.scss';

const SetCustomizer = () => {
    const [setId, setSetId] = useState('');
    const [setInfo, setSetInfo] = useState(null);
    const [setParts, setSetParts] = useState([]);
    const [customParts, setCustomParts] = useState([]);
    const [error, setError] = useState('');

    const fetchSetParts = async () => {
        setError('');
        setSetInfo(null);
        setSetParts([]);

        try {
            // First, fetch set information
            const setResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${setId}/`, {
                headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` }
            });
            setSetInfo(setResponse.data);

            // Then, fetch set parts
            const partsResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${setId}/parts/`, {
                headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` }
            });
            setSetParts(partsResponse.data.results);
        } catch (error) {
            console.error('Error fetching set information or parts:', error);
            setError('Failed to fetch set information or parts. Please check the Set ID and try again.');
        }
    };

    const saveCustomSet = async () => {
        const customizedSet = { setId, parts: [...setParts, ...customParts] };
        console.log('Saving customized set:', customizedSet);
        // Logic for saving with Laravel API will go here
    };

    return (
        <div className={styles.customizerContainer}>
            <h2 className={styles.title}>LEGO Set Customizer</h2>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={setId}
                    onChange={(e) => setSetId(e.target.value)}
                    placeholder="Enter LEGO Set ID"
                    className={styles.input}
                />
                <button onClick={fetchSetParts} className={styles.button}>
                    Fetch Set Parts
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {setInfo && (
                <div className={styles.setInfo}>
                    <h3>{setInfo.name}</h3>
                    <p>Set Number: {setInfo.set_num}</p>
                    <p>Year: {setInfo.year}</p>
                    <p>Number of Parts: {setInfo.num_parts}</p>
                </div>
            )}

            <PartList setParts={setParts} />
            <PartSearch setCustomParts={setCustomParts} />
            <CustomParts customParts={customParts} />

            <button onClick={saveCustomSet} className={styles.saveButton}>
                Save Customized Set
            </button>
        </div>
    );
};

export default SetCustomizer;