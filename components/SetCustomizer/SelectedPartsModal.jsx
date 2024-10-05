import React from 'react';
import Modal from 'react-modal';
import styles from './SetCustomizer.module.scss';

const SelectedPartsModal = ({ isOpen, onRequestClose, selectedParts, removePart, submitSelection }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <div className={styles.modalContent}>
                <h2>Selected Parts</h2>
                <button onClick={onRequestClose} className={styles.closeButton}>&times;</button>
                {selectedParts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h3>No selected parts yet!</h3>
                        <p>Search for sets or parts and select them to add to your custom set.</p>
                        <button onClick={onRequestClose} className={styles.searchButton}>Search sets/parts</button>
                    </div>
                ) : (
                    <>
                            <ul className={styles.selectedPartsList}>
                                {selectedParts.map((part) => (
                                    <li key={part.id || part.part_num} className={styles.selectedPart}>
                                        <img src={part.part?.part_img_url || part.part_img_url} alt={part.part?.name || part.name} className={styles.selectedPartImage} />
                                        <div className={styles.selectedPartInfo}>
                                        <h4>{part.part?.name || part.name}</h4>
                                        <p>ID: {part.part?.part_num || part.part_num}</p>
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
            </div>
        </Modal>
    );
};

export default SelectedPartsModal;
