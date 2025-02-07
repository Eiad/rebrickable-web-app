import React, { useState } from 'react';
import axios from 'axios';
import styles from './SetCustomizer.module.scss';
import SelectedPartsModal from '../SelectedPartsModal';
import { lego_logo_icon, openList_icon, loader_icon } from '@/utilities/images';
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
    const [themeInfo, setThemeInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkedParts, setCheckedParts] = useState([]);

    const handleSearch = async () => {
        setError('');
        setSearchResults([]);
        setThemeInfo(null);
        setIsLoading(true);
        setSelectedSearchParts([]);
        setCheckedParts([]);
        try {
            let results = [];
            if (searchType === 'set') {
                const setInfoResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${searchQuery}/`, {
                    headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` }
                });
                const setInfo = setInfoResponse.data;
                
                const themeResponse = await axios.get(`https://rebrickable.com/api/v3/lego/themes/${setInfo.theme_id}/`, {
                    headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` }
                });
                setThemeInfo(themeResponse.data);

                const setPartsResponse = await axios.get(`https://rebrickable.com/api/v3/lego/sets/${searchQuery}/parts/`, {
                    headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` }
                });
                const setParts = setPartsResponse.data.results.map(item => ({
                    ...item,
                    isSetPart: true
                }));
                results = [{ setInfo, parts: setParts }];
            } else {
                const partResponse = await axios.get(`https://rebrickable.com/api/v3/lego/parts/`, {
                    headers: { 'Authorization': `key ${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}` },
                    params: { search: searchQuery }
                });
                results = partResponse.data.results.map(item => ({
                    ...item,
                    isSetPart: false
                }));
            }
            setSearchResults(results);

            if (results.length === 0) {
                setError('No results found. Try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            setError('Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectPart = (event, part) => {
        event.preventDefault();
        const partId = part.id || part.part_num;
        setSelectedSearchParts(prevSelected => {
            const newSelected = prevSelected.includes(partId)
                ? prevSelected.filter(id => id !== partId)
                : [...prevSelected, partId];
            setCheckedParts(newSelected);
            return newSelected;
        });
    };

    const selectAllParts = () => {
        const partsToSelect = searchResults.length === 1 && searchResults[0].parts
            ? searchResults[0].parts
            : searchResults;
        const selectedIds = partsToSelect.map(part => part.id || part.part_num);
        setSelectedSearchParts(selectedIds);
        setCheckedParts(selectedIds);
    };

    const unselectAllParts = () => {
        setSelectedSearchParts([]);
        setCheckedParts([]);
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
            
            // Clear the selection after successs
            setSelectedParts([]);
            
        } catch (error) {
            console.error('Error submitting:', error);
            let errorMessage = 'Adding failed';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server';
            } else {
                errorMessage = `Error occurred: ${error.message}`;
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
            const newParts = partsToAdd.map(part => ({
                ...part,
                id: part.id || part.part_num,
                part_num: part.part?.part_num || part.part_num,
                name: part.part?.name || part.name,
                part_img_url: part.part?.part_img_url || part.part_img_url
            }));
            return [...prevSelected, ...newParts.filter(newPart => !prevSelected.some(p => p.id === newPart.id))];
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (submissionStatus && submissionStatus.success) {
            setSelectedParts([]);
            setSelectedSearchParts([]);
            setCheckedParts([]);
        }
        setSubmissionStatus(null);
        setCustomSetId(uuidv4());
    };

    return (
        <div className={styles.mainWrapper}>
            <div className={styles.container}>
                <div className={styles.customizerContainer}>
                    <div className={`${styles.logoContainer} text-center`}>
                        <img src={lego_logo_icon} alt="LEGO Logo" className={styles.logo} />
                    </div>
                    <div className={styles.mainBodyContainer}>
                        <div className={`${styles.searchHead} text-center`}>
                            <h1 className={styles.mainTitle}><span>LEGO®</span> Set Customizer</h1>   
                            <p className={styles.mainSubTitle}>Enter a LEGO set or part&#39;s ID to get started!</p>                     
                            <div className={styles.searchContainer}>
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className={styles.searchTypeSelect}
                                >
                                    <option value="set">Set</option>
                                    <option value="part">Parts</option>
                                </select>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search ${searchType === 'set' ? 'set (Ex. 10338-1)' : 'parts (Ex. 92198pr0275)'}`}
                                    className={styles.searchInput}
                                />
                                <button 
                                    onClick={handleSearch} 
                                    className={styles.searchButton} 
                                    disabled={isLoading || searchQuery.trim() === ''}
                                >
                                    {isLoading ? (
                                        <img src={loader_icon} alt="Loading" className={styles.loadingIcon} />
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.mainContent}>
                            <div className={styles.contentContainer}>
                                {searchResults.length > 0 && (
                                    <>
                                        <h2 className={styles.sectionTitle}>
                                            {searchResults.length === 1 && searchResults[0].setInfo ? 'Set Information' : ''}
                                        </h2>
                                        {searchResults.length === 1 && searchResults[0].setInfo && (
                                            <div className={styles.setInfo}>
                                                <div className={styles.setHeroImg}>
                                                    <img src={searchResults[0].setInfo.set_img_url} alt={searchResults[0].setInfo.name} className={styles.setImage} />
                                                </div>
                                                <div className={styles.setDetails}>
                                                    <p className={styles.setNumberHero}>ID: #{searchResults[0].setInfo.set_num}</p>
                                                    <h3 className={styles.setName}>{searchResults[0].setInfo.name}</h3>
                                                    <div className={styles.setInfoGrid}>
                                                        <div className={styles.setInfoItem}>
                                                            <span className={styles.setInfoLabel}>Set Number</span>
                                                            <span className={styles.setInfoValue}>{searchResults[0].setInfo.set_num}</span>
                                                        </div>
                                                        <div className={styles.setInfoItem}>
                                                            <span className={styles.setInfoLabel}>Year</span>
                                                            <span className={styles.setInfoValue}>{searchResults[0].setInfo.year}</span>
                                                        </div>  
                                                        <div className={styles.setInfoItem}>
                                                            <span className={styles.setInfoLabel}>Inventory</span>
                                                            <span className={styles.setInfoValue}>{searchResults[0].setInfo.num_parts}</span>
                                                        </div>                                                                                                              
                                                        <div className={styles.setInfoItem}>
                                                            <span className={styles.setInfoLabel}>Theme</span>
                                                            <span className={styles.setInfoValue}>{themeInfo ? themeInfo.name : 'Loading...'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.partsHeader}>
                                            <h3 className={styles.partsTitle}>
                                                {searchResults.length === 1 && searchResults[0].setInfo ? 'Parts in this set:' : 'Search Results:'}
                                            </h3>
                                            <div className={styles.controlButtons}>
                                                <button onClick={selectAllParts} className={styles.secondaryButton}>Select All</button>
                                                <button onClick={unselectAllParts} className={styles.secondaryButton}>Unselect All</button>
                                            </div>
                                        </div>
                                        <div className={styles.resultsContainer}>
                                            <div className={styles.partGrid}>
                                                {(searchResults.length === 1 && searchResults[0].parts ? searchResults[0].parts : searchResults).map((item) => (
                                                    <div 
                                                        key={item.id || item.part_num} 
                                                        className={styles.partCard}
                                                        onClick={(e) => toggleSelectPart(e, item)}
                                                    >
                                                        <img src={item.part?.part_img_url || item.part_img_url} alt={item.part?.name || item.name} />
                                                        <div className={styles.partInfo}>
                                                            <p className={styles.partId}>ID: {item.part?.part_num || item.part_num}</p>
                                                            <h4>{item.part?.name || item.name}</h4>
                                                            {item.quantity && <p className={styles.partQuantity}>Quantity: {item.quantity}</p>}
                                                        </div>
                                                        <label className={styles.checkbox}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.checkboxInput}
                                                                checked={checkedParts.includes(item.id || item.part_num)}
                                                                onChange={(e) => e.stopPropagation()} 
                                                            />
                                                            <span className={styles.checkmark}></span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.SearchCtaContainer}>
                                            <button 
                                                className={styles.addSelectedButton}
                                                disabled={selectedSearchParts.length === 0}
                                                onClick={addSelectedParts}
                                            >
                                                Add Selected Parts
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className={styles.floatingButton}>
                <img src={openList_icon} alt="Open Selected Parts" />
            </button>
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