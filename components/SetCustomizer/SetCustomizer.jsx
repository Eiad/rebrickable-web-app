import React, { useState } from 'react';
import axios from 'axios';
import styles from './SetCustomizer.module.scss';
import SelectedPartsModal from './SelectedPartsModal';
import { v4 as uuidv4 } from 'uuid';

const SetCustomizer = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [error, setError] = useState('');
    const [setInfo, setSetInfo] = useState(null);
    const [setParts, setSetParts] = useState([]);
    const [selectedSearchParts, setSelectedSearchParts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchType, setSearchType] = useState('set');
    const [customSetId, setCustomSetId] = useState(uuidv4());
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const handleSearch = async () => {
        setError('');
        setSearchResults([]);
        try {
            if (searchType === 'set') {
                const setInfoResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${searchQuery}/`, {
                    headers: { 'Authorization': `key ${process.env.REBRICKABLE_API_KEY}` }
                });
                const setInfo = setInfoResponse.data;
                const setPartsResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${searchQuery}/parts/`, {
                    headers: { 'Authorization': `key ${process.env.REBRICKABLE_API_KEY}` }
                });
                const setParts = setPartsResponse.data.results.map(item => ({
                    ...item,
                    isSetPart: true
                }));
                setSearchResults([{ setInfo, parts: setParts }]);
            } else {
                const partResponse = await axios.get(`https://rebrickable.com/api/v3/lego/parts/`, {
                    headers: { 'Authorization': `key ${process.env.REBRICKABLE_API_KEY}` },
                    params: { search: searchQuery }
                });
                const individualParts = partResponse.data.results.map(item => ({
                    ...item,
                    isSetPart: false
                }));
                setSearchResults(individualParts);
            }

            if (searchResults.length === 0) {
                setError('No resultsZZZZ. Try again.');
            }
        } catch (error) {
            console.error('Search errorrrry:', error);
            setError('Search faileddo dododo.');
        }
    };

    const toggleSelectPart = (part) => {
        const partId = part.id || part.part_num;
        setSelectedSearchParts(prevSelected =>
            prevSelected.includes(partId)
                ? prevSelected.filter(id => id !== partId)
                : [...prevSelected, partId]
        );
    };

    const selectAllParts = () => {
        const partsToSelect = searchResults.length === 1 && searchResults[0].parts
            ? searchResults[0].parts
            : searchResults;
        setSelectedSearchParts(partsToSelect.map(part => part.id || part.part_num));
    };

    const unselectAllParts = () => {
        setSelectedSearchParts([]);
    };

    const removePart = (partId) => {
        setSelectedParts(selectedParts.filter(part => (part.id || part.part_num) !== partId));
    };

    const submitSelection = async () => {
        try {
            const partsToSubmit = selectedParts.map(part => ({
                name: part.part?.name || part.name,
                part_number: part.part?.part_num || part.part_num,
                quantity: part.quantity || 1
            }));

            const response = await axios.post(`${process.env.NEXT_PUBLIC_LEGO_API_BASE_URL}/api/custom-sets`, {
                custom_set_id: customSetId,
                parts: partsToSubmit
            });

            console.log('Custom set added:', response.data);
            setSubmissionStatus({
                success: true,
                message: 'Your custom set has been added to the database!',
                id: response.data.id || customSetId
            });
        } catch (error) {
            console.error('Error submittingzzz:', error);
            let errorMessage = 'Adding failedoo dododo';
            if (error.response) {
                errorMessage = `Server oopsieZzZz: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No answerZzzzZ';
            } else {
                errorMessage = `Error happenedZZZZ: ${error.message}`;
            }
            setSubmissionStatus({
                success: false,
                message: errorMessage
            });
        }
    };

    const addSelectedParts = () => {
        const partsToAdd = (searchResults.length === 1 && searchResults[0].parts ? searchResults[0].parts : searchResults)
            .filter(part => selectedSearchParts.includes(part.id || part.part_num));
        setSelectedParts(prevSelected => {
            const newParts = partsToAdd.filter(part => !prevSelected.some(p => (p.id || p.part_num) === (part.id || part.part_num)));
            return [...prevSelected, ...newParts];
        });
        setSelectedSearchParts([]);
        setIsModalOpen(true); 
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedParts([]);
        setSubmissionStatus(null);
        setCustomSetId(uuidv4()); 
    };

    return (
        <div className={styles.customizerContainer}>
            <h1 className={styles.mainTitle}>LEGO Set Customizer</h1>
            <div className={styles.searchContainer}>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className={styles.searchTypeSelect}
                >
                    <option value="set">Set</option>
                    <option value="part">Part</option>
                </select>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search LEGO ${searchType === 'set' ? 'Sets' : 'Parts'}`}
                    className={styles.searchInput}
                />
                <button onClick={handleSearch} className={styles.searchButton}>
                    Search
                </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    {searchResults.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h2>Search your first set or parts</h2>
                            <p>Enter a LEGO set number or part name to get started!</p>
                        </div>
                    ) : (
                        <>
                                <div className={styles.controlButtons}>
                                    <button onClick={selectAllParts} className={styles.secondaryButton}>Select All</button>
                                    <button onClick={unselectAllParts} className={styles.secondaryButton}>Unselect All</button>
                                </div>
                                <h2 className={styles.sectionTitle}>
                                    {searchResults.length === 1 && searchResults[0].setInfo ? 'Set Information' : 'Search Results'}
                                </h2>
                                {searchResults.length === 1 && searchResults[0].setInfo && (
                                    <div className={styles.setInfo}>
                                        <img src={searchResults[0].setInfo.set_img_url} alt={searchResults[0].setInfo.name} className={styles.setImage} />
                                        <div className={styles.setDetails}>
                                            <h3>{searchResults[0].setInfo.name}</h3>
                                            <p>Set Number: {searchResults[0].setInfo.set_num}</p>
                                            <p>Year: {searchResults[0].setInfo.year}</p>
                                            <p>Number of Parts: {searchResults[0].setInfo.num_parts}</p>
                                        </div>
                                    </div>
                                )}
                                <h3 className={styles.partsTitle}>
                                    {searchResults.length === 1 && searchResults[0].setInfo ? 'Parts in this set:' : 'Search Results:'}
                                </h3>
                                <div className={styles.resultsContainer}>
                                    <div className={styles.partGrid}>
                                        {(searchResults.length === 1 && searchResults[0].parts ? searchResults[0].parts : searchResults).map((item) => (
                                            <div key={item.id || item.part_num} className={styles.partCard}>
                                                <img src={item.part?.part_img_url || item.part_img_url} alt={item.part?.name || item.name} />
                                                <div className={styles.partInfo}>
                                                    <h4>{item.part?.name || item.name}</h4>
                                                    <p>ID: {item.part?.part_num || item.part_num}</p>
                                                    {item.quantity && <p>Quantity: {item.quantity}</p>}
                                                </div>
                                                <label className={styles.checkbox}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.checkboxInput}
                                                        checked={selectedSearchParts.includes(item.id || item.part_num)}
                                                        onChange={() => toggleSelectPart(item)}
                                                    />
                                                    <span className={styles.checkmark}></span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={addSelectedParts} className={styles.addSelectedButton}>
                                    Add Selected Parts
                                </button>
                        </>
                    )}
                </div>
                <button onClick={() => setIsModalOpen(true)} className={styles.floatingButton}>
                    Open Selected Parts
                </button>
            </div>
            <SelectedPartsModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                selectedParts={selectedParts}
                removePart={removePart}
                submitSelection={submitSelection}
                submissionStatus={submissionStatus}
            />
        </div>
    );
};

export default SetCustomizer;