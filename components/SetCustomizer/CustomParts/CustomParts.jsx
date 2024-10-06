import React from 'react';
import styles from './SetCustomizer.module.scss';

const CustomParts = ({ customParts }) => (
    <div>
        <h3 className={styles.sectionTitle}>Custom Parts</h3>
        <ul className={styles.partList}>
            {customParts.map((part, index) => (
                <li key={index} className={styles.partItem}>
                    <span>{part.name}</span>
                    <img src={part.part_img_url} alt={part.name} width="30" height="30" />
                </li>
            ))}
        </ul>
    </div>
);

export default CustomParts;