import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { Fish, Lock, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const success = await login(phoneNumber, password);

  setIsLoading(false);

  if (success) {
    toast.success("Login successful");
    navigate("/");
  } else {
    toast.error("Invalid phone number or password");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1667673077638-3dbc8f39d357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwb2NlYW4lMjBjb3JhbCUyMHJlZWZ8ZW58MXx8fHwxNzY4NTEzNzMwfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/70 via-blue-900/70 to-indigo-900/70 dark:from-cyan-950/80 dark:via-blue-950/80 dark:to-indigo-950/80" />

      {/* Animated floating particles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full"
        animate={{
          y: [0, -100, 0],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-300/40 rounded-full"
        animate={{
          y: [0, -120, 0],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-300/50 rounded-full"
        animate={{
          y: [0, -90, 0],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Login Card with Glass-morphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/10 dark:bg-white/5 rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Logo/Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
          <img
            src="/ARLogo.png"
            alt="AR Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

          </motion.div>
          {/* Title */}
          <motion.h1
            className="text-3xl font-bold text-center text-white mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Login
          </motion.h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-6 bg-white/10 border-2 border-white/30 rounded-full text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-6 bg-white/10 border-2 border-white/30 rounded-full text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                {/* <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                /> */}
                {/* <span className="text-sm">Remember me</span> */}
              </label>
            
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-white text-blue-600 hover:bg-white/90 rounded-full font-semibold text-lg shadow-lg transition-all"
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </motion.div>
          </form>

          {/* Register Link */}
          <motion.div
            className="mt-6 text-center text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
           
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            className="mt-8 pt-6 border-t border-white/20 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="font-semibold text-white/90 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-white/80">
              <p className="font-mono">Phone: <span className="font-semibold text-cyan-300">0772222222</span></p>
              <p className="font-mono">Password: <span className="font-semibold text-cyan-300">admin123</span></p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}