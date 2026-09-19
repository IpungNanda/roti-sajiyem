"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

import { auth } from "@/lib/firebase";

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const headerLogoVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      type: "spring" as const,
      stiffness: 200,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const errorVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    x: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 0,
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.5,
      x: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.3 },
      height: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
};

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.6, ease: "easeOut" as const },
  },
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Login berhasil
      router.replace("/admin");
    } catch (error: unknown) {
      console.error("Login error:", error);

      const firebaseError = error as {
        code?: string;
      };

      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "Email atau password yang Anda masukkan salah."
          );
          break;

        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;

        case "auth/too-many-requests":
          setError(
            "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
          );
          break;

        default:
          setError(
            "Login gagal. Silakan periksa kembali email dan password Anda."
          );
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbea]">
      {/* ==========================================
          BACKGROUND DECORATION
      ========================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-green-200/50 blur-3xl"
      />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* ==========================================
              LOGIN CARD
          ========================================== */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-xl"
          >
            {/* ==========================================
                HEADER
            ========================================== */}
            <div className="relative overflow-hidden bg-green-800 px-7 py-10 text-center sm:px-9">
              {/* Decorative */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-yellow-400/15 blur-xl"
              />

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-green-500/20 blur-xl"
              />

              <div className="relative">
                {/* Logo */}
                <motion.div
                  variants={headerLogoVariants}
                  whileHover={{ scale: 1.05 }}
                  className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg"
                >
                  <span className="text-2xl font-extrabold tracking-tight text-green-800">
                    RS
                  </span>

                  <motion.span
                    animate={{ rotate: [0, 12, -12, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-800 bg-yellow-400"
                  >
                    <FiCheckCircle className="h-3.5 w-3.5 text-green-950" />
                  </motion.span>
                </motion.div>

                <motion.h1
                  variants={headerItemVariants}
                  className="mt-5 text-2xl font-bold tracking-tight text-white"
                >
                  Roti Sajiyem
                </motion.h1>

                <motion.div
                  variants={headerItemVariants}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-green-50"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiShield className="h-3.5 w-3.5" />
                  </motion.span>
                  Panel Administrator
                </motion.div>
              </div>
            </div>

            {/* ==========================================
                FORM
            ========================================== */}
            <div className="px-6 py-8 sm:px-9">
              <motion.div
                variants={formItemVariants}
                className="mb-7"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  Selamat Datang
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Silakan masuk untuk mengelola sistem Roti Sajiyem.
                </p>
              </motion.div>

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* ==========================================
                    EMAIL
                ========================================== */}
                <motion.div variants={formItemVariants}>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Admin
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="Masukkan email admin"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* ==========================================
                    PASSWORD
                ========================================== */}
                <motion.div variants={formItemVariants}>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {/* Show / Hide Password */}
                    <motion.button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      disabled={loading}
                      whileTap={{ scale: 0.85 }}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-green-700 disabled:cursor-not-allowed"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={showPassword ? "off" : "on"}
                          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {showPassword ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                {/* ==========================================
                    ERROR
                ========================================== */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-start gap-3 overflow-hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3"
                    >
                      <motion.span
                        animate={{
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="mt-0.5 shrink-0"
                      >
                        <FiAlertCircle className="h-5 w-5 text-red-500" />
                      </motion.span>

                      <p className="text-sm leading-5 text-red-600">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ==========================================
                    LOGIN BUTTON
                ========================================== */}
                <motion.button
                  variants={formItemVariants}
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Memproses...
                    </>
                  ) : (
                    <>
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <FiShield className="h-4 w-4" />
                      </motion.span>

                      Masuk sebagai Admin

                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <FiArrowRight className="h-5 w-5" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* ==========================================
                  SECURITY INFO
              ========================================== */}
              <motion.div
                variants={formItemVariants}
                className="mt-7 rounded-2xl border border-green-100 bg-green-50/70 p-4"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
                  >
                    <FiShield className="h-4 w-4" />
                  </motion.div>

                  <div>
                    <p className="text-xs font-bold text-green-800">
                      Akses Administrator
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-700/70">
                      Halaman ini khusus digunakan oleh administrator
                      untuk mengelola sistem Roti Sajiyem.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ==========================================
                  FOOTER
              ========================================== */}
              <motion.div
                variants={formItemVariants}
                className="mt-7 border-t border-gray-100 pt-5 text-center"
              >
                <p className="text-xs font-medium text-gray-500">
                  Sistem Informasi Roti Sajiyem
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Panel khusus administrator
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ==========================================
              COPYRIGHT
          ========================================== */}
          <motion.div
            variants={footerVariants}
            initial="hidden"
            animate="visible"
            className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiCheckCircle className="h-3.5 w-3.5 text-green-600" />
            </motion.span>

            <p>
              © {new Date().getFullYear()} Roti Sajiyem
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}