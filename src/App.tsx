import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme } from './lib/themes';
import { motion } from 'framer-motion';

function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none bg-[#020204]">
      <motion.div 
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full opacity-30 blur-[80px] will-change-transform"
        style={{ background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)', filter: 'saturate(1.5)' }}
      />
      <motion.div 
        animate={{ x: ['5%', '-5%', '5%'], y: ['2%', '-2%', '2%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full opacity-20 blur-[70px] will-change-transform"
        style={{ background:
