import { useState } from "react";
import { 
  Shield, 
  Key, 
  Wallet, 
  Zap, 
  ArrowRight, 
  Code2, 
  Lock, 
  ShieldAlert, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Github, 
  Send, 
  MessageSquare, 
  Twitter, 
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToDocs: () => void;
}

export default function LandingPage({ onNavigateToDashboard, onNavigateToDocs }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is an Ephemeral Session Key?",
      a: "A Session Key is a temporary cryptographic key pair generated locally on your interface. Instead of giving your master private keys to automated AI Agents, you delegate specific, restricted, and time-bound execution privileges to this local key. The agent signs gasless transactions autonomously, but has zero physical power to steal raw assets."
    },
    {
      q: "How do Programmable On-Chain Guardrails protect me?",
      a: "Permissions are enforced directly at the blockchain level inside the smart contract 'AI_GuardrailModule.sol' on Arbitrum Sepolia. The contract checks if the target DeFi protocol is in the Whitelist, if the volume exceeds today's limit, or if the temporal session is expired. If any rule is broken, the transaction instantly reverts, meaning even a compromised AI agent is physically blocked on-chain."
    },
    {
      q: "Are the AI transaction operations truly gasless?",
      a: "Yes. By utilizing the ERC-4337 Account Abstraction standard, transaction payloads are routed using custom ArbAgentPaymaster signatures. Gas costs are sponsored at the smart contract level, eliminating the requirement to seed and manage native gas tokens on vulnerable remote agent environments."
    },
    {
      q: "How does the AI transform English instructions into on-chain calls?",
      a: "The system uses high-precision Gemini 3.5 Flash services server-side to parse conversational prompts into structured JSON parameters. These parameters are matched against known whitelisted smart contract configurations, wrapped in UserOperations, and securely dispatched to decentralized bundlers."
    },
    {
      q: "What resources can the master owner override?",
      a: "The human master owner holds absolute custody of the ArbAgentAccount contract. At any instant, you can manually reset accumulated limits, rotate session privileges, toggle whitelists, or freeze all operational delegation instantly through standard multisig or hardware keys."
    }
  ];

  const techStack = [
    {
      name: "Arbitrum Sepolia",
      category: "L2 Execution",
      desc: "Powers low-latency, secure rollups with minimum block times and gas efficiencies, perfect for high-speed automated agent triggers.",
      borderColor: "hover:border-cyan-500/30",
      accent: "text-cyan-400"
    },
    {
      name: "ERC-4337",
      category: "Account Abstraction",
      desc: "The industry standard decoupling cryptography from custody. Custom entrypoint routers validate ephemeral session keys.",
      borderColor: "hover:border-purple-500/30",
      accent: "text-purple-400"
    },
    {
      name: "Gemini 3.5 Flash",
      category: "Decision Parsing",
      desc: "Our server-side LLM parses natural language prompts, mapping them into structured smart-contract parameters.",
      borderColor: "hover:border-pink-500/30",
      accent: "text-pink-400"
    },
    {
      name: "Guardrail Solidity",
      category: "On-Chain Security",
      desc: "Robust, self-contained interception module that guarantees absolute policy compliance right inside the transaction call stacks.",
      borderColor: "hover:border-blue-500/30",
      accent: "text-blue-400"
    },
    {
      name: "Pimlico Bundlers",
      category: "Infrastructure",
      desc: "High-volume block packers processing transactions gaslessly via prepended custom Paymaster sponsorship signatures.",
      borderColor: "hover:border-fuchsia-500/30",
      accent: "text-fuchsia-400"
    }
  ];

  // Motion variants for staggering entrance animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="text-[#E0E0E0] max-w-5xl mx-auto px-4 py-8 sm:py-16 space-y-24 relative overflow-hidden">
      
      {/* Decorative RGB Background Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-gradient-to-tr from-pink-500/5 to-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero section with RGB spectrum styling */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-left space-y-6 max-w-4xl relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 bg-[#0d0d0d] border border-cyan-500/20 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.1)]"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ARBITRUM SEPOLIA GAS SPONSORSHIP SPAN
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-5xl sm:text-7xl font-sans font-black tracking-tighter leading-none text-white uppercase italic"
        >
          THE IMMUTABLE <br />
          GUARDIAN FOR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 select-none animate-pulse">
            AI AGENTS.
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-sm sm:text-base text-[#888] leading-relaxed max-w-2xl font-sans font-medium"
        >
          Phylax SDK is a premium ERC-4337 Account Abstraction infrastructure on Arbitrum Sepolia. Delegate execution privileges safely via ephemeral Session Keys while locking down wallet behavior on-chain through custom Programmable Guardrails.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="pt-4 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onNavigateToDashboard}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-500 text-white font-black uppercase tracking-widest text-xs transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.4)] hover:scale-[1.01]"
          >
            Launch Control Panel
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={onNavigateToDocs}
            className="w-full sm:w-auto px-8 py-4 bg-[#080808] border border-purple-500/20 text-gray-300 hover:text-white hover:border-cyan-400 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none hover:bg-black/80"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            Read SDK & Smart Contract Docs
          </button>
        </motion.div>
      </motion.div>

      {/* Visual Interception Flowchart Section with glowing borders */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-[#080808] border border-slate-800/80 p-6 sm:p-8 rounded-none relative"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-purple-500"></div>
        <h3 className="text-xs font-mono font-bold uppercase text-white tracking-widest mb-8 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-fuchsia-400" />
          THE PHYLAX INTERCEPTION FLOW
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative font-mono">
          {/* Step 1 */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col p-4 bg-black border border-[#222] relative rounded-none hover:border-cyan-500/40 transition-all duration-300"
          >
            <span className="text-cyan-400 font-bold text-xs mb-2">01. AI DEVELOPS DECISION</span>
            <p className="text-[11px] text-[#888] leading-normal">
              Autonomous agent decides transaction details (e.g. swap on Uniswap) using local live logic patterns.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col p-4 bg-black border border-[#222] relative rounded-none hover:border-purple-500/40 transition-all duration-300"
          >
            <span className="text-purple-400 font-bold text-xs mb-2">02. TEMPORAL SIGNATURE</span>
            <p className="text-[11px] text-[#888] leading-normal">
              Saves operations using temporary ephemeral session keys without exposing master owner's private key.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col p-4 bg-[#0A0A0A] border border-fuchsia-500/30 relative rounded-none shadow-[0_0_15px_rgba(236,72,153,0.08)] bg-gradient-to-br from-black to-[#220c22]"
          >
            <span className="text-fuchsia-400 font-bold text-xs mb-2 flex items-center gap-1.5 animate-pulse">
              03. ON-CHAIN GUARDRAIL
            </span>
            <p className="text-[11px] text-gray-200 leading-normal">
              Phylax Contract interceptor verifies limits and whitelists directly level on-chain, blocking any malicious actions.
            </p>
          </motion.div>

          {/* Step 4 */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col p-4 bg-black border border-[#222] relative rounded-none hover:border-blue-500/40 transition-all duration-300"
          >
            <span className="text-blue-400 font-bold text-xs mb-2">04. SAFE DISPATCH</span>
            <p className="text-[11px] text-[#888] leading-normal">
              Successful transaction completes with fully sponsored gas fee. Drains are safely prevented!
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* TECH STACK SECTION ("Tech yang digunakan") */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-8 relative z-10"
      >
        <div className="text-left space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono block font-black">
            INTEGRATED RGB PROTOCOL STACK
          </span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight italic">
            DEVELOPED TECHNOLOGY IMPLEMENTATION_
          </h2>
          <p className="text-[#888] text-xs max-w-xl">
            A state-of-the-art stack bridging machine intelligence parsing and resilient on-chain enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {techStack.map((tech, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5, borderColor: "rgba(139,92,246,0.5)" }}
              className={`p-5 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-slate-900 rounded-none flex flex-col justify-between transition-all duration-300 hover:shadow-[0_4px_20px_rgba(6,182,212,0.05)]`}
            >
              <div>
                <span className="text-[#555] font-mono text-[9px] block uppercase tracking-wider mb-2">
                  {tech.category}
                </span>
                <h4 className="text-sm font-extrabold uppercase font-mono text-white mb-3">
                  {tech.name}
                </h4>
                <p className="text-[11px] text-[#888] leading-relaxed font-sans">
                  {tech.desc}
                </p>
              </div>
              <div className={`mt-4 font-mono text-[8px] ${tech.accent} tracking-widest uppercase`}>
                // INTEGRATED
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Q&A SECTION */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-8 relative z-10"
      >
        <div className="text-left space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-mono block font-black">
            DEVELOPER & OPERATOR ROADMAP
          </span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight italic">
            SECURITY FAQS & INSTRUCTIONS
          </h2>
          <p className="text-[#888] text-xs max-w-xl">
            Get absolute transparency regarding our on-chain Account Abstraction delegative constraints.
          </p>
        </div>

        {/* Accordion loop with premium borders */}
        <div className="border border-slate-800 bg-[#080808] divide-y divide-slate-800 font-mono">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="transition-all">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-[#0C0C0C] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-black">
                      0{index + 1}.
                    </span>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#555]" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden bg-[#050505]"
                    >
                      <div className="px-6 pb-6 pt-2 text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Developer Quickstart Sandbox Hook */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-[#080808] border border-slate-800 p-5 font-mono text-xs max-w-3xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-transparent"></div>
        <div className="flex justify-between items-center text-[#555] mb-2">
          <span className="uppercase text-[9px] tracking-widest font-bold">quickstart-example.ts</span>
          <span className="text-[9px] uppercase tracking-tighter">SDK Version 1.0.4</span>
        </div>
        <div className="text-[#888] scale-[0.98] origin-left">
          <span className="text-cyan-400">import</span> {"{"} Phylax {"}"} <span className="text-cyan-400">from</span> <span className="text-orange-300 font-bold">"@phylax/sdk"</span>;
          <br />
          <span className="text-purple-400">const</span> secureClient = <span className="text-cyan-400">await</span> Phylax.<span className="text-purple-400">connect</span>(sessionKey);
          <br />
          <span className="text-[#555]">// Ready to execute securely on Arbitrum Sepolia</span>
        </div>
      </motion.div>

      {/* COMPLETE FOOTER WITH SOCIALS */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-slate-800 pt-12 pb-6 space-y-12 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <h3 className="text-3xl font-sans font-black tracking-tighter text-white">
              PHYLAX<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-extrabold">.</span>
            </h3>
            <p className="text-[11px] text-[#555] uppercase tracking-wider font-mono">
              Smart-policy guardrails protecting smart agent capital on-chain.
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-4 font-mono text-xs">
            <span className="block text-[9px] uppercase tracking-widest text-[#555] font-black">
              SOCIAL CHANNELS
            </span>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Organization
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  X / Twitter Broadcast
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Discord Developer HUB
                </a>
              </li>
              <li>
                <a 
                  href="https://telegram.org" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Telegram Alert Sync
                </a>
              </li>
            </ul>
          </div>

          {/* Internal Map */}
          <div className="space-y-4 font-mono text-xs">
            <span className="block text-[9px] uppercase tracking-widest text-[#555] font-black">
              UTILITIES MAP
            </span>
            <ul className="space-y-2">
              <li>
                <button onClick={onNavigateToDashboard} className="text-gray-400 hover:text-fuchsia-400 transition-colors uppercase cursor-pointer">
                  01_ Vault Interface
                </button>
              </li>
              <li>
                <button onClick={onNavigateToDocs} className="text-gray-400 hover:text-fuchsia-400 transition-colors uppercase cursor-pointer">
                  02_ Technical Documentations
                </button>
              </li>
              <li>
                <span className="text-gray-650 block uppercase">
                  03_ Arbitrum Block Explorer
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Node Info */}
          <div className="space-y-4 font-mono text-xs">
            <span className="block text-[9px] uppercase tracking-widest text-[#555] font-black">
              CONTACT & STATUS
            </span>
            <div className="space-y-2 text-[#888]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400 select-all">security@phylax.network</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[#00FF41]">ARBITRUM NODE LIVE • SPONSORSHIP SPOOL</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#555] uppercase tracking-wider gap-4">
          <span>PHYLAX SECURITY STANDARDS v1.0.4 • AUDITED BY CONSENSYS DILIGENCE & CURVE SEC</span>
          <span>© 2026 PHYLAX PROTOCOL INC • CO CUSTODY DECENTRALIZED</span>
        </div>
      </motion.footer>

    </div>
  );
}
