'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Gift, Sparkles } from 'lucide-react';
import { Prize } from '../../types/api';
import styles from '../../styles/components/Wheel.module.css';

interface FortuneWheelProps {
  prizes: Prize[];
  onSpinComplete: (prize: Prize) => void;
  isSpinning: boolean;
  disabled?: boolean;
  className?: string;
}

const FortuneWheel: React.FC<FortuneWheelProps> = ({
  prizes,
  onSpinComplete,
  isSpinning,
  disabled = false,
  className,
}) => {
  const [rotation, setRotation] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const getSegmentAngle = (index: number) => {
    return (360 / prizes.length) * index;
  };

  const getRandomRotation = () => {
    const baseRotation = 3600; // 10 full rotations
    const randomAngle = Math.random() * 360;
    return baseRotation + randomAngle;
  };

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled) return;

    const getWinningPrize = (finalRotation: number) => {
      const normalizedRotation = finalRotation % 360;
      const segmentAngle = 360 / prizes.length;
      const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
      return prizes[segmentIndex] || prizes[0];
    };

    const randomRotation = getRandomRotation();
    const newRotation = rotation + randomRotation;
    
    setRotation(newRotation);
    setShowPrize(false);
    setWonPrize(null);

    // Simulate spinning with multiple phases
    setTimeout(() => {
      const winningPrize = getWinningPrize(newRotation);
      setWonPrize(winningPrize);
      setShowPrize(true);
      onSpinComplete(winningPrize);
    }, 3000);
  }, [isSpinning, disabled, rotation, onSpinComplete, prizes]);

  const renderSegment = (prize: Prize, index: number) => {
    const angle = getSegmentAngle(index);
    const segmentAngle = 360 / prizes.length;
    const rotationAngle = angle + segmentAngle / 2;

    return (
      <div
        key={prize.id}
        className={`${styles.wheelSegment} ${styles[`segment${(index % 8) + 1}`]}`}
        style={{
          transform: `rotate(${angle}deg)`,
          width: '100%',
          height: '100%',
        }}
      >
        <div
          className={styles.segmentText}
          style={{
            left: '50%',
            top: '25%',
            transform: `rotate(${rotationAngle}deg) translate(-50%, -50%)`,
            transformOrigin: 'center',
          }}
        >
          <div className="flex flex-col items-center">
            <Gift size={16} className="mb-1" />
            <span className="text-xs font-bold">{prize.name}</span>
          </div>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const wheelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`${styles.wheelContainer} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Particles effect */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className={`${styles.wheel} ${styles.glow} ${isSpinning ? styles.wheelSpin : ''}`}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
        variants={wheelVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Segments */}
        {prizes.map((prize, index) => renderSegment(prize, index))}

        {/* Center circle */}
        <div className={styles.wheelCenter}>
          <Sparkles size={24} className="text-orange-500" />
        </div>
      </motion.div>

      {/* Pointer */}
      <div className={styles.wheelPointer} />

      {/* Spin button */}
      <motion.button
        className={styles.spinButton}
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Play size={20} className="mr-2" />
        {isSpinning ? 'En cours...' : 'Tourner'}
      </motion.button>

      {/* Prize display modal */}
      <AnimatePresence>
        {showPrize && wonPrize && (
          <motion.div
            className={styles.prizeDisplay}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🎉
            </motion.div>
            <h3 className={styles.prizeTitle}>Félicitations !</h3>
            <p className={styles.prizeDescription}>{wonPrize.description}</p>
            <div className={styles.prizeValue}>{wonPrize.name}</div>
            <motion.button
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              onClick={() => setShowPrize(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continuer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FortuneWheel;
