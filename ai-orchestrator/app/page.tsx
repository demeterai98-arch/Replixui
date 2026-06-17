"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// مكون أيقونة متحركة (ديكور)
const FloatingIcon = ({ src, alt, delay = 0 }) => (
  <motion.div
    initial={{ y: 0, opacity: 0.6 }}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 4, repeat: Infinity, delay }}
    className="absolute opacity-20 dark:opacity-10 pointer-events-none"
  >
    <Image src={src} alt={alt} width={40} height={40} />
  </motion.div>
);

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-900 dark:to-black font-sans antialiased">
      
      {/* الخلفية الديناميكية (شبكة وتوهجات) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-zinc-200/20 dark:bg-grid-zinc-700/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

      {/* أيقونات عائمة للزينة */}
      <FloatingIcon src="/next.svg" alt="Next" delay={0} style={{ top: '10%', left: '5%' }} />
      <FloatingIcon src="/vercel.svg" alt="Vercel" delay={1.5} style={{ bottom: '15%', right: '8%' }} />

      <main className="relative z-10 flex min-h-screen w-full max-w-5xl mx-auto flex-col items-center justify-center px-6 py-20 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-3xl rounded-3xl bg-white/60 backdrop-blur-xl shadow-2xl shadow-black/5 dark:bg-black/60 dark:shadow-white/5 border border-white/20 dark:border-white/10 p-8 sm:p-12 md:p-16"
        >
          <div className="flex flex-col items-center gap-10 text-center sm:items-start sm:text-left">
            {/* الشعار مع تأثير hover */}
            <motion.div whileHover={{ scale: 1.05, rotate: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={120}
                height={30}
                priority
              />
            </motion.div>

            {/* النص الرئيسي */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-sm text-4xl font-extrabold leading-tight tracking-tight text-black dark:text-white bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent"
              >
                ابدأ بتعديل <br /><span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">page.tsx</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
              >
                هل تبحث عن نقطة انطلاق أو إرشادات إضافية؟ توجه إلى{" "}
                <Link
                  href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                  className="font-semibold text-zinc-900 dark:text-white underline decoration-blue-400/30 hover:decoration-blue-400 transition-all duration-300"
                  target="_blank"
                >
                  القوالب
                </Link>{" "}
                أو{" "}
                <Link
                  href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                  className="font-semibold text-zinc-900 dark:text-white underline decoration-purple-400/30 hover:decoration-purple-400 transition-all duration-300"
                  target="_blank"
                >
                  مركز التعلم
                </Link>
                .
              </motion.p>
            </div>

            {/* الأزرار */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col gap-4 w-full sm:flex-row sm:w-auto"
            >
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 text-white shadow-lg shadow-zinc-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/30 dark:from-white dark:to-zinc-200 dark:text-black dark:shadow-white/10 dark:hover:shadow-white/20 sm:w-[180px]"
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="invert group-hover:rotate-12 transition-transform duration-300 dark:invert-0"
                  src="/vercel.svg"
                  alt="Vercel"
                  width={18}
                  height={18}
                />
                <span>نشر الآن</span>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-zinc-300/50 bg-transparent px-6 font-medium text-zinc-700 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-100/50 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40 dark:hover:bg-white/5 sm:w-[180px]"
                href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                التوثيق
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        {/* تذييل صغير */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 text-xs text-zinc-400 dark:text-zinc-600"
        >
          ✦ صنع بـ Next.js 14 ✦
        </motion.p>
      </main>
    </div>
  );
}
