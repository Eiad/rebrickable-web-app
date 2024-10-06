import React from 'react';
import styles from './PartList.module.scss';

const PartList = ({ setParts }) => {
    return (
        <div className={styles.partList}>
            <h3>Set Parts</h3>
            {setParts.length > 0 ? (
                <ul>
                    {setParts.map((part) => (
                        <li key={part.id}>
                            {part.part.name} - Quantity: {part.quantity}
                            <img src={part.part.part_img_url} alt={part.part.name} className={styles.partImage} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No parts to display. Search for a sets/parts and add them to your custom set.</p>
            )}
        </div>
    );
};

export default PartList;