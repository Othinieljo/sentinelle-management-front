'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
// @ts-ignore
import * as d3 from 'd3';
import { 
  ArrowLeft,
  Gift, 
  Zap,
  Trophy,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MemberService, SpinBalance } from '@/lib/services/memberService';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { useToastContext } from '@/components/ui/Toast/ToastProvider';
import { useRouter } from 'next/navigation';

// Palette de couleurs premium orange/rouge
const COLORS = ['#f97316', '#ea580c', '#fb923c', '#c2410c'];

interface WheelSegment {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  color: string;
  value?: number;
  description?: string;
}

const WheelPage: React.FC = () => {
  const { addToast } = useToastContext();
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();
  
  // États
  const [balance, setBalance] = useState<SpinBalance | null>(null);
  const [activePrizes, setActivePrizes] = useState<any[]>([]);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<any | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [rotation, setRotation] = useState(0);

  // Dimensions de la roue
  const wheelSize = 340;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const radius = wheelSize / 2 - 10;

  // Générer les segments avec D3.js
  const generateSegments = useCallback((prizes: any[]) => {
    if (!prizes || prizes.length === 0) return [];

    const pie = d3.pie<any>()
      .value(() => 1)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = pie(prizes);

    return arcs.map((arcData: any, index: number) => ({
      id: prizes[index].id,
      name: prizes[index].name,
      startAngle: arcData.startAngle,
      endAngle: arcData.endAngle,
      color: COLORS[index % COLORS.length],
      value: prizes[index].value,
      description: prizes[index].description,
      path: arc(arcData as any) || '',
      centroid: arc.centroid(arcData as any)
    }));
  }, [radius]);

  // Charger les données initiales
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [balanceData, prizesData, campaignData] = await Promise.all([
        MemberService.getSpinBalance(),
        MemberService.getActivePrizes(),
        MemberService.getActiveCampaign()
      ]);
      
      setBalance(balanceData);
      setActivePrizes(prizesData);
      setActiveCampaign(campaignData);
      
      // Générer les segments avec D3
      const generatedSegments = generateSegments(prizesData);
      setSegments(generatedSegments);
      
    } catch (err: any) {
      console.error('Error loading wheel data:', err);
      setError('Erreur lors du chargement des données');
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données de la roue'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, generateSegments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculer l'angle final basé sur le prix gagné
  const calculateTargetRotation = useCallback((prizeName: string) => {
    const prizeIndex = activePrizes.findIndex(p => p.name === prizeName);
    if (prizeIndex === -1) return rotation + 360 * 8; // Rotation par défaut

    const segmentAngle = 360 / activePrizes.length;
    
    // Le pointeur est en haut (0°), on veut que le centre du segment gagné soit en haut
    // Chaque segment commence à prizeIndex * segmentAngle
    // Le centre du segment est à prizeIndex * segmentAngle + segmentAngle/2
    const segmentCenterAngle = prizeIndex * segmentAngle + (segmentAngle / 2);
    
    // Pour amener le centre du segment en haut (0°), on doit tourner de 360 - segmentCenterAngle
    const targetAngle = 360 - segmentCenterAngle;
    
    // Ajouter plusieurs tours complets pour l'effet dramatique
    const fullRotations = 8 + Math.random() * 2;
    const totalRotation = (fullRotations * 360) + targetAngle;
    
    console.log('🎯 Calcul de rotation:', {
      prizeName,
      prizeIndex,
      segmentAngle,
      segmentCenterAngle,
      targetAngle,
      fullRotations,
      totalRotation,
      currentRotation: rotation,
      finalRotation: rotation + totalRotation
    });
    
    return rotation + totalRotation;
  }, [activePrizes, rotation]);

  // Gérer le tour de roue
  const handleSpin = async () => {
    if (!balance || balance.available_spins <= 0) {
      addToast({
        type: 'error',
        title: 'Pas de spins disponibles',
        message: 'Vous devez d\'abord contribuer pour gagner des spins'
      });
      return;
    }

    if (!activeCampaign || isSpinning || segments.length === 0) {
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    
    try {
      // 1. Appeler l'API pour obtenir le résultat
      const result = await MemberService.spinWheel({
        campaign_id: activeCampaign.id,
        user_agent: navigator.userAgent
      });
      
      console.log('🎰 Résultat du backend:', result);
      
      // 2. Calculer la rotation cible basée sur le prix gagné
      let targetPrizeName = '';
      
      if (result.prize_won) {
        targetPrizeName = result.prize_won.name;
        console.log('🎁 Prix gagné:', targetPrizeName);
      } else {
        // Pas de prix - choisir un segment aléatoire
        const randomIndex = Math.floor(Math.random() * activePrizes.length);
        targetPrizeName = activePrizes[randomIndex]?.name || '';
        console.log('❌ Pas de prix - segment aléatoire:', targetPrizeName);
      }
      
      const finalRotation = calculateTargetRotation(targetPrizeName);
      
      // 3. Animation avec Framer Motion
      await controls.start({
        rotate: finalRotation,
        transition: {
          duration: 6,
          ease: [0.17, 0.67, 0.12, 0.99], // Easing professionnel
        }
      });
      
      setRotation(finalRotation % 360); // Garder l'angle final normalisé
      
      // 4. Traiter le résultat
      setIsSpinning(false);
      
      // Mettre à jour le solde
      const updatedBalance = await MemberService.getSpinBalance();
      setBalance(updatedBalance);
      
      if (result.prize_won) {
        setWonPrize(result.prize_won);
        setShowResult(true);
        
        addToast({
          type: 'success',
          title: '🎉 Félicitations !',
          message: `Vous avez gagné : ${result.prize_won.name}`,
          duration: 6000
        });
      } else {
        setTimeout(() => {
          addToast({
            type: 'info',
            title: 'Pas de chance cette fois',
            message: 'Réessayez encore !',
            duration: 4000
          });
        }, 1000);
      }
      
    } catch (err: any) {
      console.error('Error spinning wheel:', err);
      setIsSpinning(false);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de tourner la roue'
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la roue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center px-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={loadData} variant="gradient" className="w-full">
              Réessayer
            </Button>
            <Button onClick={handleGoBack} variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-lg mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button onClick={handleGoBack} variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Roue de la Fortune</h1>
            {activeCampaign && (
              <p className="text-gray-600 text-sm">{activeCampaign.name}</p>
            )}
          </div>
        </motion.div>

        {/* Informations sur les spins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Spins disponibles</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {balance?.available_spins || 0}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || (balance?.available_spins || 0) <= 0}
                  variant="gradient"
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  {isSpinning ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      Tourner
                    </>
                  )}
                </Button>
              </div>
              
              {balance && balance.available_spins <= 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs sm:text-sm text-yellow-700 text-center">
                    Vous n'avez pas de spins. Faites un paiement pour en gagner !
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Roue de la fortune avec D3.js */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-4 sm:p-8">
              <div className="relative flex justify-center items-center">
                
                {/* Indicateur (pointeur) - Fixe en haut */}
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20"
                  animate={{ 
                    y: isSpinning ? [0, 8, 0] : 0,
                    scale: isSpinning ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    duration: 0.15,
                    repeat: isSpinning ? Infinity : 0
                  }}
                >
                  <div className="relative">
                    <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-orange-500 drop-shadow-xl"></div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                </motion.div>

                {/* SVG de la roue avec D3.js */}
                <div className="relative">
                  <motion.svg
                    ref={svgRef}
                    width={wheelSize}
                    height={wheelSize}
                    viewBox={`0 0 ${wheelSize} ${wheelSize}`}
                    className="drop-shadow-2xl"
                    animate={controls}
                    style={{ originX: 0.5, originY: 0.5 }}
                  >
                    <defs>
                      {/* Dégradé pour le centre */}
                      <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </radialGradient>
                      
                      {/* Ombre portée */}
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="4" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge> 
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Cercle extérieur décoratif */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={radius + 5}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3"
                      opacity="0.3"
                    />

                    {/* Segments générés par D3 */}
                    <g filter="url(#shadow)">
                      {segments.map((segment, index) => {
                        const arc = d3.arc()
                          .innerRadius(0)
                          .outerRadius(radius)
                          .startAngle(segment.startAngle)
                          .endAngle(segment.endAngle);

                        const pathData = arc(null as any);
                        const centroid = arc.centroid(null as any);
                        
                        // Calculer l'angle pour le texte
                        const angle = ((segment.startAngle + segment.endAngle) / 2) * (180 / Math.PI);

                        return (
                          <g key={segment.id} transform={`translate(${centerX}, ${centerY})`}>
                            {/* Segment */}
                            <path
                              d={pathData || ''}
                              fill={segment.color}
                              stroke="white"
                              strokeWidth="3"
                              className="transition-opacity duration-300"
                            />
                            
                            {/* Texte du segment */}
                            <text
                              x={centroid[0]}
                              y={centroid[1]}
                              fill="white"
                              fontSize="12"
                              fontWeight="700"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${angle}, ${centroid[0]}, ${centroid[1]})`}
                              style={{ 
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                pointerEvents: 'none',
                                userSelect: 'none'
                              }}
                            >
                              {segment.name}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Centre de la roue */}
                    <g transform={`translate(${centerX}, ${centerY})`}>
                      {/* Cercle blanc extérieur */}
                      <circle r="45" fill="white" stroke="#e5e7eb" strokeWidth="3"/>
                      
                      {/* Cercle orange avec dégradé */}
                      <circle r="35" fill="url(#centerGradient)"/>
                      
                      {/* Étoile */}
                      <text
                        fill="white"
                        fontSize="28"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ★
                      </text>
                    </g>

                    {/* Points décoratifs aux coins */}
                    {!isSpinning && [0, 90, 180, 270].map((angle, i) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = centerX + (radius + 15) * Math.cos(rad - Math.PI / 2);
                      const y = centerY + (radius + 15) * Math.sin(rad - Math.PI / 2);
                      
                      return (
                        <motion.circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#f97316"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.6, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        />
                      );
                    })}
                  </motion.svg>
                </div>
              </div>
              
              {/* Indicateur pendant le spin */}
              <AnimatePresence>
                {isSpinning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-orange-700 font-medium text-sm">
                        La roue tourne...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prix disponibles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 text-orange-600" />
                Prix Disponibles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {activePrizes.slice(0, 6).map((prize, index) => (
                  <div
                    key={prize.id}
                    className="rounded-lg p-3 text-center transition-transform hover:scale-105"
                    style={{ backgroundColor: `${COLORS[index % COLORS.length]}15` }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{prize.name}</p>
                    {prize.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{prize.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de résultat */}
        <AnimatePresence>
          {showResult && wonPrize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowResult(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center relative overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Confettis */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: COLORS[i % COLORS.length],
                      top: '50%',
                      left: '50%'
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 400],
                      y: [0, (Math.random() - 0.5) * 400],
                      opacity: [1, 0],
                      scale: [1, 0],
                      rotate: [0, Math.random() * 360]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.03,
                      ease: "easeOut"
                    }}
                  />
                ))}
                
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 sm:mb-6"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </motion.div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Félicitations !
                </h2>
                <p className="text-gray-600 mb-4">Vous avez gagné :</p>
                
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 mb-6 border-2 border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">
                    {wonPrize.name}
                  </h3>
                  {wonPrize.description && (
                    <p className="text-gray-600 text-sm mb-2">{wonPrize.description}</p>
                  )}
                  {wonPrize.value && (
                    <div className="inline-block px-4 py-2 bg-green-500 rounded-full mt-2">
                      <p className="text-white font-bold">
                        {wonPrize.value.toLocaleString()} FCFA
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Button onClick={() => setShowResult(false)} variant="gradient" className="w-full">
                    Continuer
                  </Button>
                  <Button onClick={handleGoBack} variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au Dashboard
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WheelPage;