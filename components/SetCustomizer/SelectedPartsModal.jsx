import React, { useState, useMemo } from 'react';
import Modal from 'react-modal';
import styles from '../SetCustomizer/SetCustomizer/SetCustomizer.module.scss';

const SelectedPartsModal = ({ isOpen, onRequestClose, selectedParts, removePart, submitSelection, submissionStatus }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredParts = useMemo(() => {
        return selectedParts.filter(part => {
            const name = (part.part?.name || part.name || '').toLowerCase();
            const id = (part.part?.part_num || part.part_num || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            return name.includes(query) || id.includes(query);
        });
    }, [selectedParts, searchQuery]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className={styles.modal}
            overlayClassName={styles.overlay}
            ariaHideApp={false}
        >
            <div className={styles.modalContent}>
                <h2>Selected Parts</h2>
                <button onClick={onRequestClose} className={styles.closeButton}>&times;</button>
                {submissionStatus ? (
                    <div className={submissionStatus.success ? styles.successMessage : styles.errorMessage}>
                        <p>{submissionStatus.message}</p>
                        {submissionStatus.success && submissionStatus.id && (
                            <p>Custom Set ID: <b>{submissionStatus.id}</b></p>
                        )}
                        <button 
                            onClick={onRequestClose} 
                            className={`${styles.submitButton} ${styles.databaseSubmitted}`}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {selectedParts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h3>No selected parts yet!</h3>
                                <p>Search for sets or parts and select them to add to your custom set.</p>
                                <button onClick={onRequestClose} className={styles.searchButton}>Search sets/parts</button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search this selecion..."
                                    className={styles.searchInputFilter}
                                />
                                <ul className={styles.selectedPartsList}>
                                    {filteredParts.map((part) => (
                                        <li key={part.id || part.part_num} className={styles.selectedPart}>
                                            <img src={part.part?.part_img_url || part.part_img_url} alt={part.part?.name || part.name} className={styles.selectedPartImage} />
                                            <div className={styles.selectedPartInfo}>
                                                <p className={styles.setNumberHero}>ID: #{part.part?.part_num || part.part_num}</p>
                                                <h4>{part.part?.name || part.name}</h4>
                                            </div>
                                            <button onClick={() => removePart(part.id || part.part_num)} className={styles.removeButton}>
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={submitSelection} className={styles.submitButton}>
                                    Submit Selection
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default SelectedPartsModal;
