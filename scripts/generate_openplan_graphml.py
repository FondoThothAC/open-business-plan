#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador Maestro del Diagrama de Arquitectura de Open Business Plan (OpenPlan)
Formato: GraphML nativo para yEd Graph Editor + SVG vectorial de alta resolución.
Incluye:
- Entrada & Semilla (Vaciado de cerebro, 6 pilares, AdaptiveSeedForm, DualInputSyncHub)
- Metodología Empresas Cuánticas (Modelo Atómico 3 Áreas, Principio Nuclear, Delegación, Saltos Cuánticos, Independencia, Anti-patrones)
- Mesa de Expertos Multi-Agente & Orquestador IA (Niveles 1-4, Cascada Fallback Ollama/NIM/Groq, Telemetría SSE)
- Embudo de Industrialización: Los 12 Métodos Estratégicos (Comercial, Social BID, Lean Canvas, I+D, etc.)
- Hub de Mercado Territorial (DENUE/INEGI Scraping espacial, Google Places, TAM-SAM-SOM, FODA/PESTEL)
- Hub Técnico & Operaciones (FloorPlan, Process Flow, Machinery RFQ, KPIs OTD/DSO/CCC)
- Motor Financiero Integral (calculadoraFinanciera.js, Estados NIF B-2/B-3/B-6, Monte Carlo 10,000 iteraciones, Reserva Laboral)
- Organización & Gobernanza (Organigrama, Matriz de Capital Humano, Matriz RACI, Células Amoeba)
- Persistencia & Exportación (PlanContext, FileSystem en proyectos/, Word/PDF/MD, DiffReview)
- Bob Bot Concierge AI & Herramientas de Productividad
"""

import os
import xml.etree.ElementTree as ET
from xml.dom import minidom

GRAPHML_NS = "http://graphml.graphdrawing.org/xmlns"
YWORKS_NS = "http://www.yworks.com/xml/graphml"
YED_NS = "http://www.yworks.com/xml/yed/3"
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"

NODES_DEF = [
    # -------------------------------------------------------------
    # 1. CABECERA & SISTEMA CENTRAL
    # -------------------------------------------------------------
    {
        "id": "n_logo",
        "label": "Open Business Plan (OpenPlan) • Master Architecture\nIndustrialization & Business Formulation Engine\nPowered by Fondo Thoth AC",
        "x": 600, "y": 0, "w": 500, "h": 85,
        "fill": "#0A0D18", "border": "#00F3FF", "shape": "roundrectangle", "is_bold": True, "font_size": 13, "text_color": "#FFFFFF"
    },
    {
        "id": "n_sys_init",
        "label": "Inicialización del Sistema & Detección de Hardware\n(GPU VRAM, Ollama Local Serve, Electron Desktop Bridge, Node/Vite)",
        "x": 640, "y": 115, "w": 420, "h": 65,
        "fill": "#0F172A", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#F8FAFC"
    },
    {
        "id": "n_setup_wizard",
        "label": "¿Primera Ejecución?\nSetupWizard (Hardware, Ollama & Puertos)",
        "x": 1100, "y": 115, "w": 300, "h": 65,
        "fill": "#1E1B4B", "border": "#F59E0B", "shape": "diamond", "is_bold": True, "font_size": 10, "text_color": "#FEF3C7"
    },
    {
        "id": "n_user_matrix",
        "label": "Matriz de Usuarios & Aislamiento de Proyectos\n• Super-Users (admin / roberto) con Escaneo Global Multi-Plan\n• Sub-usuarios aislados en carpetas locales proyectos/negocios/ y proyectos/social/",
        "x": 630, "y": 210, "w": 440, "h": 75,
        "fill": "#111827", "border": "#A855F7", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#E5E7EB"
    },

    # -------------------------------------------------------------
    # 2. FASE 1: ENTRADA & SEMILLA ADAPTATIVA
    # -------------------------------------------------------------
    {
        "id": "n_brain_dump",
        "label": "Vaciado de Cerebro (Entrada No Estructurada)\nAudio con Whisper/Dictado • Texto Libre • Carga de PDFs con OCR",
        "x": 640, "y": 315, "w": 420, "h": 70,
        "fill": "#1E293B", "border": "#0284C7", "shape": "parallelogram", "is_bold": True, "font_size": 11, "text_color": "#F0F9FF"
    },
    {
        "id": "n_seed_extraction",
        "label": "Mesa de Extracción NLP de Semilla Universal\n(6 Pilares: Propósito, Problema/Solución, Mercado, Técnico, Finanzas, Equipo)",
        "x": 640, "y": 415, "w": 420, "h": 65,
        "fill": "#0F2847", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#FFFFFF"
    },
    {
        "id": "n_adaptive_seed",
        "label": "AdaptiveSeedForm (Revisión Interactiva de Semilla)\nValidación Campo por Campo con Asistencia Contextual de Dudas por IA",
        "x": 640, "y": 510, "w": 420, "h": 70,
        "fill": "#064E3B", "border": "#10B981", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#ECFDF5"
    },
    {
        "id": "n_dual_sync",
        "label": "DualInputSyncHub (Sincronización Bidireccional)\nSincroniza en Tiempo Real el Prompt Libre y los Campos Estructurados",
        "x": 1100, "y": 415, "w": 320, "h": 75,
        "fill": "#1E1B4B", "border": "#818CF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#E0E7FF"
    },

    # -------------------------------------------------------------
    # 3. METODOLOGÍA TRANSVERSAL: EMPRESAS CUÁNTICAS (FONDO THOTH AC)
    # -------------------------------------------------------------
    {
        "id": "n_qc_header",
        "label": "METODOLOGÍA PROPIETARIA: EMPRESAS CUÁNTICAS\nCapa Transversal de Diagnóstico, Delegación & Escala (Fondo Thoth AC)",
        "x": -520, "y": 315, "w": 460, "h": 70,
        "fill": "#2E1065", "border": "#C084FC", "shape": "roundrectangle", "is_bold": True, "font_size": 12, "text_color": "#FAF5FF"
    },
    {
        "id": "n_qc_profile",
        "label": "QuantumProfileCard (Diagnóstico Inicial del Fundador)\nEvaluación Transversal Inyectada en Semilla, Organización y Finanzas",
        "x": -500, "y": 415, "w": 420, "h": 65,
        "fill": "#3B0764", "border": "#E879F9", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#FFFFFF"
    },
    {
        "id": "n_qc_atom",
        "label": "Modelo Atómico de 3 Áreas Cardinales:\n⚛️ Finanzas • ⚙️ Operativo • 📋 Administrativo",
        "x": -500, "y": 505, "w": 420, "h": 70,
        "fill": "#2A0845", "border": "#C084FC", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#F3E8FF"
    },
    {
        "id": "n_qc_nuclear",
        "label": "Principio Nuclear: Máximo 1 o 2 Áreas Activas\n¡Prohibido operar las 3! Evita fusión atómica, sesgo y micromanagement",
        "x": -500, "y": 600, "w": 420, "h": 70,
        "fill": "#4C0519", "border": "#F43F5E", "shape": "diamond", "is_bold": True, "font_size": 10, "text_color": "#FFE4E6"
    },
    {
        "id": "n_qc_delegation",
        "label": "Principio de Delegación Estructurada:\nGeneración automática de vacantes, perfiles complementarios y bandas salariales",
        "x": -500, "y": 695, "w": 420, "h": 75,
        "fill": "#1E1B4B", "border": "#A78BFA", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#EDE9FE"
    },
    {
        "id": "n_qc_quantum_leaps",
        "label": "Saltos Cuánticos de Escala (Crecimiento No Lineal):\nAlertas en umbrales de reestructuración atómica (1-5, 5-20, multi-sucursal)",
        "x": -500, "y": 795, "w": 420, "h": 70,
        "fill": "#0F172A", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#E0F2FE"
    },
    {
        "id": "n_qc_independence",
        "label": "Principio de Independencia del Fundador:\nMedición de dependencia operativa y hoja de ruta para operar SIN el fundador",
        "x": -500, "y": 890, "w": 420, "h": 65,
        "fill": "#064E3B", "border": "#34D399", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#D1FAE5"
    },
    {
        "id": "n_qc_antipatterns",
        "label": "Detector de 4 Anti-Patrones Cuánticos:\n1. Solo quiere ser jefe • 2. Solo invertir • 3. Dinero rápido • 4. Fusión atómica",
        "x": -500, "y": 980, "w": 420, "h": 70,
        "fill": "#431407", "border": "#FB923C", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFEDD5"
    },

    # -------------------------------------------------------------
    # 4. MESA DE EXPERTOS & ORQUESTADOR IA
    # -------------------------------------------------------------
    {
        "id": "n_ai_orchestrator",
        "label": "Orquestador Multi-Agente (src/lib/ai.js & server/index.js)\nMesa de Expertos Virtuales para Redacción, Crítica y Calibración Técnica",
        "x": 620, "y": 620, "w": 460, "h": 75,
        "fill": "#1E1B4B", "border": "#C084FC", "shape": "roundrectangle", "is_bold": True, "font_size": 12, "text_color": "#FAF5FF"
    },
    {
        "id": "n_ai_depth_levels",
        "label": "Matriz de 4 Niveles de Profundidad de Agentes:\n• Nivel 1 (Rápido): Analista ➔ Redactor (~30-60s)\n• Nivel 2 (Pro): Analista ➔ Crítico ➔ Redactor (~2-4 min)\n• Nivel 3 (Profundo): 5 Agentes Especialistas + Devil's Advocate (~8-15 min)\n• Nivel 4 (Industrial): Cadena de 9 Agentes en bucle cerrado (~20 min)",
        "x": 600, "y": 725, "w": 500, "h": 95,
        "fill": "#0F172A", "border": "#818CF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#F1F5F9"
    },
    {
        "id": "n_ai_fallback",
        "label": "Cascada Inteligente de Proveedores & Fallback:\n1º Ollama Local (qwen3.5:9b / gemma4:12b) [Local-First]\n2º Modelos Locales de Respaldo según VRAM disponible\n3º Nube NVIDIA NIM (llama-3.1-nemotron-70b-instruct)\n4º Nube Groq (llama-3.3-70b) / Gemini 2.0 / OpenAI (gpt-4o)",
        "x": 1130, "y": 620, "w": 380, "h": 90,
        "fill": "#1C1917", "border": "#F59E0B", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FEF3C7"
    },
    {
        "id": "n_ai_telemetry",
        "label": "Telemetría, Streaming SSE & Reintentos:\n• ActivityFeed en tiempo real por Server-Sent Events\n• fetchWithRetry con Backoff Exponencial en HTTP 429\n• Monitor de Tokens y Cuotas de API (GlobalTokenMonitor)",
        "x": 1130, "y": 735, "w": 380, "h": 85,
        "fill": "#0C4A6E", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#E0F2FE"
    },

    # -------------------------------------------------------------
    # 5. EMBUDO DE INDUSTRIALIZACIÓN: LOS 12 MÉTODOS ESTRATÉGICOS
    # -------------------------------------------------------------
    {
        "id": "n_ind_engine",
        "label": "Motor de Industrialización de Métodos (FIELD_GUIDES_MAP)\nTransforma la Semilla Universal inyectando jerga técnica y reglas del método",
        "x": 620, "y": 860, "w": 460, "h": 75,
        "fill": "#042F2E", "border": "#2DD4BF", "shape": "roundrectangle", "is_bold": True, "font_size": 12, "text_color": "#F0FDFA"
    },
    # Fila 1 de Métodos
    {
        "id": "n_m1_business",
        "label": "1. Plan Comercial Clásico\nNaturaleza, Mercado, Técnico, Org & Finanzas",
        "x": -520, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m2_social_bid",
        "label": "2. Social BID / PM4R\nInvolucrados, Árboles, MML, EDT & Riesgos",
        "x": -190, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m3_lean_mvp",
        "label": "3. Agile Startup (Lean Canvas)\n9 Bloques, Buyer Persona, CAC/LTV & Runway",
        "x": 140, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m4_tech_id",
        "label": "4. Base Tecnológica I+D\nNivel TRL 1-9, Patentes, Prototipos & RSE",
        "x": 470, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m5_micro",
        "label": "5. Microempresa & Autoempleo\nFlujo Paso a Paso, Local & Gastos Clave",
        "x": 800, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m6_invest",
        "label": "6. Proyecto de Inversión\nDemanda Elástica, Layout, CAPEX & WACC",
        "x": 1130, "y": 975, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    # Fila 2 de Métodos
    {
        "id": "n_m7_zopp",
        "label": "7. ZOPP / Marco Lógico Alemán\nMatriz Participación, Objetivos & MPP",
        "x": -520, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m8_horizon",
        "label": "8. Horizon Europe (UE)\nConsorcios, Open Science & Principio DNSH",
        "x": -190, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m9_hoshin",
        "label": "9. Hoshin Kanri (Japón)\nTrue North, Breakthroughs, Matriz X & Bowler",
        "x": 140, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m10_amoeba",
        "label": "10. Amoeba Management (Kyocera)\nCélulas Micro-Ganancia & Rentabilidad/Hora",
        "x": 470, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m11_guanxi",
        "label": "11. Metodología Guanxi (China)\nMapa Relaciones, Plan Quinquenal & Mianzi",
        "x": 800, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_m12_onudi",
        "label": "12. Factibilidad ONUDI Global\nIngeniería Base, FCFF & Sensibilidad WACC",
        "x": 1130, "y": 1065, "w": 300, "h": 65,
        "fill": "#134E4A", "border": "#5EEAD4", "shape": "roundrectangle", "is_bold": True, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 6. HUB DE INTELIGENCIA DE MERCADO & TERRITORIALIDAD
    # -------------------------------------------------------------
    {
        "id": "n_market_hub",
        "label": "HUB DE INTELIGENCIA DE MERCADO & TERRITORIALIDAD",
        "x": -520, "y": 1200, "w": 400, "h": 65,
        "fill": "#0F2847", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#F0F9FF"
    },
    {
        "id": "n_inegi_map",
        "label": "Scraping Espacial DENUE / INEGI (InegiMap.jsx)\nGeolocalización de Competidores, Polígonos y Mapa de Calor Leaflet",
        "x": -520, "y": 1285, "w": 400, "h": 70,
        "fill": "#0284C7", "border": "#7DD3FC", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_google_places",
        "label": "Scraping de Competencia Digital (Google / Places / UberEats / ML)\nExtracción de Precios, Calificaciones y Reseñas de Clientes",
        "x": -520, "y": 1375, "w": 400, "h": 65,
        "fill": "#0369A1", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_tam_sam_som",
        "label": "Segmentación TAM • SAM • SOM & Buyer Persona\nCálculo de Mercado Total, Disponible y Arquetipo Psicológico HubSpot",
        "x": -520, "y": 1460, "w": 400, "h": 65,
        "fill": "#075985", "border": "#0284C7", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_foda_pestel",
        "label": "Matrices Estratégicas Cruzadas (FODA / PESTEL)\nEstrategias FO, FA, DO, DA amarradas al Entorno Macroeconómico",
        "x": -520, "y": 1545, "w": 400, "h": 65,
        "fill": "#0C4A6E", "border": "#38BDF8", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 7. HUB TÉCNICO, OPERACIONES & PLANTA
    # -------------------------------------------------------------
    {
        "id": "n_ops_hub",
        "label": "HUB TÉCNICO, OPERACIONES & PLANTA (ModuloOperaciones.jsx)",
        "x": -90, "y": 1200, "w": 400, "h": 65,
        "fill": "#431407", "border": "#FB923C", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#FFF7ED"
    },
    {
        "id": "n_floor_plan",
        "label": "Layout de Planta & Espacios Físicos (FloorPlanDiagram.jsx)\nDiseño de Zonas de Producción, Líneas de Ensamble y Flujo Continuo Lean",
        "x": -90, "y": 1285, "w": 400, "h": 70,
        "fill": "#7C2D12", "border": "#FDBA74", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_process_table",
        "label": "Diagrama de Procesos & Tiempos de Ciclo (ProcessTable.jsx)\nMapeo de Pasos Críticos, Cuellos de Botella TOC y Economías de Escala",
        "x": -90, "y": 1375, "w": 400, "h": 65,
        "fill": "#9A3412", "border": "#FB923C", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_machinery_rfq",
        "label": "Cotizador de Maquinaria & Equipamiento (MachineryRfqModal.jsx)\nFichas Técnicas, Requerimientos Trifásicos y Amortización Física",
        "x": -90, "y": 1460, "w": 400, "h": 65,
        "fill": "#C2410C", "border": "#FED7AA", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_kpi_ops",
        "label": "KPIs de Desempeño Operativo (Lean Supply Chain)\nOTD (On-Time Delivery), Rotación de Stock, DSO, DPO y Ciclo de Efectivo CCC",
        "x": -90, "y": 1545, "w": 400, "h": 65,
        "fill": "#EA580C", "border": "#FFEDD5", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 8. MOTOR FINANCIERO, SIMULACIÓN MONTE CARLO & VALUACIÓN NIF
    # -------------------------------------------------------------
    {
        "id": "n_fin_hub",
        "label": "MOTOR FINANCIERO INTEGRAL (calculadoraFinanciera.js & ModuloFinanciero)",
        "x": 340, "y": 1200, "w": 450, "h": 65,
        "fill": "#064E3B", "border": "#34D399", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#ECFDF5"
    },
    {
        "id": "n_fin_statements",
        "label": "Estados Financieros Normativos Proyectados a 5 Años (60 Meses):\n• Estado de Resultados NIF B-3 • Flujo de Efectivo NIF B-2\n• Balance General NIF B-6 • Tablas de Amortización Bancaria",
        "x": 340, "y": 1285, "w": 450, "h": 75,
        "fill": "#065F46", "border": "#6EE7B7", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_breakeven",
        "label": "Punto de Equilibrio (PE en Pesos y Unidades) & Márgenes\nAnálisis Costo-Volumen-Utilidad y Margen de Contribución Ponderado",
        "x": 340, "y": 1380, "w": 450, "h": 65,
        "fill": "#047857", "border": "#A7F3D0", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_profitability",
        "label": "Indicadores de Evaluación de Proyectos:\nVPN (Valor Presente Neto), TIR, Periodo de Recuperación y Relación B/C",
        "x": 340, "y": 1465, "w": 450, "h": 65,
        "fill": "#059669", "border": "#34D399", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_monte_carlo",
        "label": "Simulador Estocástico Monte Carlo (10,000 Iteraciones)\nDistribuciones Triangular/Normal, VaR al 95% y Probabilidad de Pérdida",
        "x": 340, "y": 1550, "w": 450, "h": 75,
        "fill": "#10B981", "border": "#D1FAE5", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#064E3B"
    },
    {
        "id": "n_scenarios_reserve",
        "label": "Multi-Escenario (Pesimista/Base/Optimista) & Reserva Laboral\nLiquidationReserveWidget (Provisión de Pasivo Laboral según LFT)",
        "x": 340, "y": 1645, "w": 450, "h": 70,
        "fill": "#047857", "border": "#6EE7B7", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 9. HUB DE ORGANIZACIÓN, TALENTO & GOBERNANZA
    # -------------------------------------------------------------
    {
        "id": "n_org_hub",
        "label": "HUB DE ORGANIZACIÓN, TALENTO & GOBERNANZA",
        "x": 820, "y": 1200, "w": 400, "h": 65,
        "fill": "#1E1B4B", "border": "#818CF8", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#EEF2FF"
    },
    {
        "id": "n_org_chart",
        "label": "Organigrama Interactivo Jerárquico (OrganigramaInteractivo.jsx)\nVisualización de Puestos, Departamentos, Jerarquías y Dependencias",
        "x": 820, "y": 1285, "w": 400, "h": 65,
        "fill": "#312E81", "border": "#A5B4FC", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_human_capital",
        "label": "Matriz de Capital Humano (HumanCapitalMatrix.jsx)\nTabulador Salarial, Cargas Patronales IMSS/INFONAVIT y Plan de Carrera",
        "x": 820, "y": 1370, "w": 400, "h": 70,
        "fill": "#3730A3", "border": "#C7D2FE", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_raci_xmatrix",
        "label": "Matriz RACI & Hoshin Kanri X-Matrix (XMatrixHoshinKanri.jsx)\nAsignación de Roles Operativos y Alineación de Tácticas con Objetivos",
        "x": 820, "y": 1460, "w": 400, "h": 70,
        "fill": "#4338CA", "border": "#E0E7FF", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },
    {
        "id": "n_amoeba_cells",
        "label": "Estructura Celular Amoeba (Inamori / Kyocera)\nCentros Autónomos de Micro-ganancia y Rentabilidad por Hora Trabajada",
        "x": 820, "y": 1550, "w": 400, "h": 65,
        "fill": "#4F46E5", "border": "#EEF2FF", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 10. PERSISTENCIA, CENTRO DE DOCUMENTOS & EXPORTACIÓN
    # -------------------------------------------------------------
    {
        "id": "n_plan_context",
        "label": "PlanContext.jsx (Single Source of Truth)\nEstado Reactivo Centralizado: Pilares, Módulos, Configuración y Versiones",
        "x": 340, "y": 1755, "w": 450, "h": 70,
        "fill": "#18181B", "border": "#FACC15", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#FEF08A"
    },
    {
        "id": "n_fs_persistence",
        "label": "Persistencia Atómica en Sistema de Archivos Local\nAuto-guardado en proyectos/negocios/ y proyectos/social/ (.json + .md)",
        "x": 340, "y": 1845, "w": 450, "h": 70,
        "fill": "#27272A", "border": "#FDE047", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FAFAFA"
    },
    {
        "id": "n_doc_center",
        "label": "Centro de Exportación Documental (WordDocumentCenterModal.jsx)\nGeneración de Expediente Ejecutivo en Word (.docx), PDF Gráfico y Markdown",
        "x": 340, "y": 1935, "w": 450, "h": 75,
        "fill": "#3F3F46", "border": "#FEF08A", "shape": "roundrectangle", "is_bold": True, "font_size": 11, "text_color": "#FFFFFF"
    },
    {
        "id": "n_diff_review",
        "label": "DiffReviewModal & DiffViewer (Control de Versiones)\nAprobación de Cambios Generados por IA con Comparación Lado a Lado",
        "x": 340, "y": 2030, "w": 450, "h": 65,
        "fill": "#52525B", "border": "#E4E4E7", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    },

    # -------------------------------------------------------------
    # 11. BOB CONCIERGE AI & HERRAMIENTAS DE INTERACCIÓN
    # -------------------------------------------------------------
    {
        "id": "n_bob_chat",
        "label": "🤖 Bob Concierge AI (BobChatModal.jsx)\nAsistente Copiloto Multimodal Flotante\nAcompañamiento, Sugerencias y Dudas en Tiempo Real",
        "x": 1600, "y": 315, "w": 360, "h": 80,
        "fill": "#4C0519", "border": "#FB7185", "shape": "roundrectangle", "is_bold": True, "font_size": 12, "text_color": "#FFF1F2"
    },
    {
        "id": "n_touchbar",
        "label": "TouchBarBridge (Hardware Shortcuts)\nAtajos Físicos para Generación, Guardado y Simulación",
        "x": 1600, "y": 420, "w": 360, "h": 65,
        "fill": "#881337", "border": "#FDA4AF", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFE4E6"
    },
    {
        "id": "n_git_sync",
        "label": "Sincronización Proactiva Git (./git_sync.sh)\nRespaldos y Versionado Automático con Mensajes Descriptivos en Español",
        "x": 1600, "y": 510, "w": 360, "h": 75,
        "fill": "#9F1239", "border": "#FECDD3", "shape": "roundrectangle", "is_bold": False, "font_size": 10, "text_color": "#FFFFFF"
    }
]

EDGES_DEF = [
    # Header to Init
    {"s": "n_logo", "t": "n_sys_init", "color": "#00F3FF", "label": "Arranque"},
    {"s": "n_sys_init", "t": "n_setup_wizard", "color": "#F59E0B", "label": "Verificar config"},
    {"s": "n_setup_wizard", "t": "n_user_matrix", "color": "#A855F7", "label": "Configurado"},
    {"s": "n_sys_init", "t": "n_user_matrix", "color": "#A855F7", "label": "Listo"},
    
    # Core to Input
    {"s": "n_user_matrix", "t": "n_brain_dump", "color": "#38BDF8", "label": "Nuevo Plan / Cargar"},
    {"s": "n_brain_dump", "t": "n_seed_extraction", "color": "#38BDF8", "label": "Extracción NLP"},
    {"s": "n_seed_extraction", "t": "n_adaptive_seed", "color": "#10B981", "label": "Semilla Universal"},
    {"s": "n_brain_dump", "t": "n_dual_sync", "color": "#818CF8", "label": "Sync"},
    {"s": "n_adaptive_seed", "t": "n_dual_sync", "color": "#818CF8", "label": "Sync bidireccional"},

    # Conexión Cuántica desde Semilla
    {"s": "n_adaptive_seed", "t": "n_qc_header", "color": "#C084FC", "label": "Diagnóstico Cuántico"},
    {"s": "n_qc_header", "t": "n_qc_profile", "color": "#E879F9", "label": "Perfil Fundador"},
    {"s": "n_qc_profile", "t": "n_qc_atom", "color": "#C084FC", "label": "3 Áreas"},
    {"s": "n_qc_atom", "t": "n_qc_nuclear", "color": "#F43F5E", "label": "Evaluación"},
    {"s": "n_qc_nuclear", "t": "n_qc_delegation", "color": "#A78BFA", "label": "Áreas débiles"},
    {"s": "n_qc_nuclear", "t": "n_qc_antipatterns", "color": "#FB923C", "label": "Alerta sesgos"},
    {"s": "n_qc_delegation", "t": "n_qc_quantum_leaps", "color": "#38BDF8", "label": "Plan de escala"},
    {"s": "n_qc_quantum_leaps", "t": "n_qc_independence", "color": "#34D399", "label": "Ruta autonomía"},

    # Semilla a Orquestador IA
    {"s": "n_adaptive_seed", "t": "n_ai_orchestrator", "color": "#C084FC", "label": "Semilla Confirmada"},
    {"s": "n_ai_orchestrator", "t": "n_ai_depth_levels", "color": "#818CF8", "label": "Nivel Seleccionado"},
    {"s": "n_ai_orchestrator", "t": "n_ai_fallback", "color": "#F59E0B", "label": "Despacho IA"},
    {"s": "n_ai_orchestrator", "t": "n_ai_telemetry", "color": "#38BDF8", "label": "Eventos SSE"},

    # IA a Motor de Industrialización
    {"s": "n_ai_depth_levels", "t": "n_ind_engine", "color": "#2DD4BF", "label": "Mesa de Expertos"},
    {"s": "n_ind_engine", "t": "n_m1_business", "color": "#5EEAD4", "label": "Comercial"},
    {"s": "n_ind_engine", "t": "n_m2_social_bid", "color": "#5EEAD4", "label": "Social BID"},
    {"s": "n_ind_engine", "t": "n_m3_lean_mvp", "color": "#5EEAD4", "label": "Lean MVP"},
    {"s": "n_ind_engine", "t": "n_m4_tech_id", "color": "#5EEAD4", "label": "Tecnología I+D"},
    {"s": "n_ind_engine", "t": "n_m5_micro", "color": "#5EEAD4", "label": "Microempresa"},
    {"s": "n_ind_engine", "t": "n_m6_invest", "color": "#5EEAD4", "label": "Inversión"},
    {"s": "n_ind_engine", "t": "n_m7_zopp", "color": "#5EEAD4", "label": "ZOPP"},
    {"s": "n_ind_engine", "t": "n_m8_horizon", "color": "#5EEAD4", "label": "Horizon EU"},
    {"s": "n_ind_engine", "t": "n_m9_hoshin", "color": "#5EEAD4", "label": "Hoshin Kanri"},
    {"s": "n_ind_engine", "t": "n_m10_amoeba", "color": "#5EEAD4", "label": "Amoeba"},
    {"s": "n_ind_engine", "t": "n_m11_guanxi", "color": "#5EEAD4", "label": "Guanxi"},
    {"s": "n_ind_engine", "t": "n_m12_onudi", "color": "#5EEAD4", "label": "ONUDI"},

    # Módulos a Hubs Especializados
    {"s": "n_m1_business", "t": "n_market_hub", "color": "#38BDF8", "label": "Pilar Mercado"},
    {"s": "n_m1_business", "t": "n_ops_hub", "color": "#FB923C", "label": "Pilar Técnico"},
    {"s": "n_m1_business", "t": "n_fin_hub", "color": "#34D399", "label": "Pilar Finanzas"},
    {"s": "n_m1_business", "t": "n_org_hub", "color": "#818CF8", "label": "Pilar Organización"},

    # Conexiones Cuánticas a Hubs de Organización y Finanzas
    {"s": "n_qc_delegation", "t": "n_org_hub", "color": "#C084FC", "label": "Inyección Vacantes"},
    {"s": "n_qc_atom", "t": "n_fin_hub", "color": "#C084FC", "label": "Presupuesto Operativo"},

    # Mercado Hub
    {"s": "n_market_hub", "t": "n_inegi_map", "color": "#7DD3FC", "label": "DENUE"},
    {"s": "n_market_hub", "t": "n_google_places", "color": "#38BDF8", "label": "Google / Uber"},
    {"s": "n_market_hub", "t": "n_tam_sam_som", "color": "#0284C7", "label": "Segmentación"},
    {"s": "n_market_hub", "t": "n_foda_pestel", "color": "#38BDF8", "label": "Estrategia"},

    # Operaciones Hub
    {"s": "n_ops_hub", "t": "n_floor_plan", "color": "#FDBA74", "label": "Lay-out"},
    {"s": "n_ops_hub", "t": "n_process_table", "color": "#FB923C", "label": "Flujo"},
    {"s": "n_ops_hub", "t": "n_machinery_rfq", "color": "#FED7AA", "label": "Maquinaria"},
    {"s": "n_ops_hub", "t": "n_kpi_ops", "color": "#FFEDD5", "label": "Métricas"},

    # Finanzas Hub
    {"s": "n_fin_hub", "t": "n_fin_statements", "color": "#6EE7B7", "label": "NIF B-2/B-3/B-6"},
    {"s": "n_fin_hub", "t": "n_breakeven", "color": "#A7F3D0", "label": "P.E. & Margen"},
    {"s": "n_fin_hub", "t": "n_profitability", "color": "#34D399", "label": "VPN / TIR"},
    {"s": "n_fin_hub", "t": "n_monte_carlo", "color": "#D1FAE5", "label": "10,000 runs"},
    {"s": "n_fin_hub", "t": "n_scenarios_reserve", "color": "#6EE7B7", "label": "Escenarios & LFT"},

    # Organización Hub
    {"s": "n_org_hub", "t": "n_org_chart", "color": "#A5B4FC", "label": "Estructura"},
    {"s": "n_org_hub", "t": "n_human_capital", "color": "#C7D2FE", "label": "Sueldos & IMSS"},
    {"s": "n_org_hub", "t": "n_raci_xmatrix", "color": "#E0E7FF", "label": "RACI / Hoshin"},
    {"s": "n_org_hub", "t": "n_amoeba_cells", "color": "#EEF2FF", "label": "Amoeba"},

    # Hubs a PlanContext
    {"s": "n_market_hub", "t": "n_plan_context", "color": "#FACC15", "label": "Estado"},
    {"s": "n_ops_hub", "t": "n_plan_context", "color": "#FACC15", "label": "Estado"},
    {"s": "n_fin_hub", "t": "n_plan_context", "color": "#FACC15", "label": "Estado"},
    {"s": "n_org_hub", "t": "n_plan_context", "color": "#FACC15", "label": "Estado"},

    # Persistencia y Exportación
    {"s": "n_plan_context", "t": "n_fs_persistence", "color": "#FDE047", "label": "Auto-save"},
    {"s": "n_plan_context", "t": "n_doc_center", "color": "#FEF08A", "label": "Exportar"},
    {"s": "n_plan_context", "t": "n_diff_review", "color": "#E4E4E7", "label": "Revisar Diff"},

    # Bob Bot & Productividad Flotante
    {"s": "n_logo", "t": "n_bob_chat", "color": "#FB7185", "label": "Copiloto IA"},
    {"s": "n_bob_chat", "t": "n_touchbar", "color": "#FDA4AF", "label": "Shortcuts"},
    {"s": "n_bob_chat", "t": "n_git_sync", "color": "#FECDD3", "label": "Git Sync"}
]

def generate_graphml():
    ET.register_namespace("", GRAPHML_NS)
    ET.register_namespace("java", "http://www.yworks.com/xml/yfiles-common/1.0/java")
    ET.register_namespace("sys", "http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0")
    ET.register_namespace("x", "http://www.yworks.com/xml/yfiles-common/markup/2.0")
    ET.register_namespace("xsi", XSI_NS)
    ET.register_namespace("y", YWORKS_NS)
    ET.register_namespace("yed", YED_NS)

    root = ET.Element(f"{{{GRAPHML_NS}}}graphml")
    root.attrib[f"{{{XSI_NS}}}schemaLocation"] = f"{GRAPHML_NS} http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd"

    # Keys definition
    keys = [
        {"id": "d0", "for": "graph", "attr.name": "Description", "attr.type": "string"},
        {"id": "d1", "for": "port", "yfiles.type": "portgraphics"},
        {"id": "d2", "for": "port", "yfiles.type": "portgeometry"},
        {"id": "d3", "for": "port", "yfiles.type": "portuserdata"},
        {"id": "d4", "for": "node", "attr.name": "url", "attr.type": "string"},
        {"id": "d5", "for": "node", "attr.name": "description", "attr.type": "string"},
        {"id": "d6", "for": "node", "yfiles.type": "nodegraphics"},
        {"id": "d7", "for": "graphml", "yfiles.type": "resources"},
        {"id": "d8", "for": "edge", "attr.name": "url", "attr.type": "string"},
        {"id": "d9", "for": "edge", "attr.name": "description", "attr.type": "string"},
        {"id": "d10", "for": "edge", "yfiles.type": "edgegraphics"},
    ]
    for k in keys:
        kelem = ET.SubElement(root, f"{{{GRAPHML_NS}}}key", id=k["id"])
        kelem.attrib["for"] = k["for"]
        if "attr.name" in k:
            kelem.attrib["attr.name"] = k["attr.name"]
            kelem.attrib["attr.type"] = k["attr.type"]
        if "yfiles.type" in k:
            kelem.attrib["yfiles.type"] = k["yfiles.type"]

    graph = ET.SubElement(root, f"{{{GRAPHML_NS}}}graph", edgedefault="directed", id="G")
    
    # Description
    desc = ET.SubElement(graph, f"{{{GRAPHML_NS}}}data", key="d0")
    desc.text = "Open Business Plan (OpenPlan) Master Architecture & Industrialization Engine - yEd Diagram"

    # Add Nodes
    for nd in NODES_DEF:
        node = ET.SubElement(graph, f"{{{GRAPHML_NS}}}node", id=nd["id"])
        data = ET.SubElement(node, f"{{{GRAPHML_NS}}}data", key="d6")
        shape_node = ET.SubElement(data, f"{{{YWORKS_NS}}}ShapeNode")

        ET.SubElement(
            shape_node, f"{{{YWORKS_NS}}}Geometry",
            height=str(nd["h"]), width=str(nd["w"]),
            x=str(nd["x"]), y=str(nd["y"])
        )
        ET.SubElement(shape_node, f"{{{YWORKS_NS}}}Fill", color=nd["fill"], transparent="false")
        ET.SubElement(shape_node, f"{{{YWORKS_NS}}}BorderStyle", color=nd["border"], type="line", width="2.0")

        font_style = "bold" if nd.get("is_bold") else "plain"
        font_size = str(nd.get("font_size", 11))
        text_color = nd.get("text_color", "#FFFFFF")

        nlabel = ET.SubElement(
            shape_node, f"{{{YWORKS_NS}}}NodeLabel",
            alignment="center",
            autoSizePolicy="content",
            fontFamily="Dialog",
            fontSize=font_size,
            fontStyle=font_style,
            hasBackgroundColor="false",
            hasLineColor="false",
            height=str(nd["h"] - 8),
            horizontalTextPosition="center",
            iconTextGap="4",
            modelName="custom",
            textColor=text_color,
            verticalTextPosition="center",
            visible="true",
            width=str(nd["w"] - 8),
            x="4", y="4"
        )
        nlabel.text = nd["label"]

        label_model = ET.SubElement(nlabel, f"{{{YWORKS_NS}}}LabelModel")
        ET.SubElement(label_model, f"{{{YWORKS_NS}}}SmartNodeLabelModel", distance="4.0")

        model_param = ET.SubElement(nlabel, f"{{{YWORKS_NS}}}ModelParameter")
        ET.SubElement(
            model_param, f"{{{YWORKS_NS}}}SmartNodeLabelModelParameter",
            labelRatioX="0.0", labelRatioY="0.0",
            nodeRatioX="0.0", nodeRatioY="0.0",
            offsetX="0.0", offsetY="0.0",
            upX="0.0", upY="-1.0"
        )

        shape_type = nd.get("shape", "roundrectangle")
        ET.SubElement(shape_node, f"{{{YWORKS_NS}}}Shape", type=shape_type)

    # Add Edges
    for idx, ed in enumerate(EDGES_DEF):
        eid = f"e{idx}"
        edge = ET.SubElement(graph, f"{{{GRAPHML_NS}}}edge", id=eid, source=ed["s"], target=ed["t"])
        data = ET.SubElement(edge, f"{{{GRAPHML_NS}}}data", key="d10")
        poly = ET.SubElement(data, f"{{{YWORKS_NS}}}PolyLineEdge")
        ET.SubElement(poly, f"{{{YWORKS_NS}}}Path", sx="0.0", sy="0.0", tx="0.0", ty="0.0")
        ET.SubElement(poly, f"{{{YWORKS_NS}}}LineStyle", color=ed.get("color", "#94A3B8"), type="line", width="1.8")
        ET.SubElement(poly, f"{{{YWORKS_NS}}}Arrows", source="none", target="standard")
        ET.SubElement(poly, f"{{{YWORKS_NS}}}BendStyle", smoothed="false")

        if "label" in ed and ed["label"]:
            elabel = ET.SubElement(
                poly, f"{{{YWORKS_NS}}}EdgeLabel",
                alignment="center",
                configuration="AutoFlippingLabel",
                distance="2.0",
                fontFamily="Dialog",
                fontSize="10",
                fontStyle="plain",
                hasBackgroundColor="false",
                hasLineColor="false",
                height="15.0",
                horizontalTextPosition="center",
                iconTextGap="4",
                modelName="custom",
                preferredPlacement="anywhere",
                ratio="0.5",
                textColor="#CBD5E1",
                verticalTextPosition="bottom",
                visible="true",
                width="80.0",
                x="-40.0", y="-10.0"
            )
            elabel.text = ed["label"]
            el_model = ET.SubElement(elabel, f"{{{YWORKS_NS}}}LabelModel")
            ET.SubElement(el_model, f"{{{YWORKS_NS}}}SmartEdgeLabelModel", autoRotationEnabled="false", defaultAngle="0.0", defaultDistance="10.0")
            el_param = ET.SubElement(elabel, f"{{{YWORKS_NS}}}ModelParameter")
            ET.SubElement(el_param, f"{{{YWORKS_NS}}}SmartEdgeLabelModelParameter", angle="0.0", distance="10.0", distanceToCenter="false", position="center", ratio="0.5", segment="0")

    xml_raw = ET.tostring(root, encoding="utf-8")
    parsed = minidom.parseString(xml_raw)
    xml_str = parsed.toprettyxml(indent="  ")
    xml_clean = "\n".join([line for line in xml_str.split("\n") if line.strip()])
    return xml_clean

def generate_svg():
    # Calculate SVG dimensions
    min_x = min(n["x"] for n in NODES_DEF) - 80
    max_x = max(n["x"] + n["w"] for n in NODES_DEF) + 80
    min_y = min(n["y"] for n in NODES_DEF) - 60
    max_y = max(n["y"] + n["h"] for n in NODES_DEF) + 60
    
    width = int(max_x - min_x)
    height = int(max_y - min_y)

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x} {min_y} {width} {height}" width="{width}" height="{height}">')
    svg.append('  <defs>')
    svg.append('    <style>')
    svg.append('      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap");')
    svg.append('      text { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }')
    svg.append('      .node-text { fill: #FFFFFF; font-size: 11px; text-anchor: middle; dominant-baseline: middle; }')
    svg.append('      .edge-line { stroke-width: 1.8px; fill: none; }')
    svg.append('      .edge-text { fill: #94A3B8; font-size: 10px; text-anchor: middle; }')
    svg.append('    </style>')
    svg.append('    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">')
    svg.append('      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#00F3FF"/>')
    svg.append('    </marker>')
    svg.append('  </defs>')
    
    # Background
    svg.append(f'  <rect x="{min_x}" y="{min_y}" width="{width}" height="{height}" fill="#05070D"/>')

    # Grid lines pattern (subtle cyber grid)
    svg.append('  <g opacity="0.1">')
    for x_grid in range(int(min_x), int(max_x), 100):
        svg.append(f'    <line x1="{x_grid}" y1="{min_y}" x2="{x_grid}" y2="{max_y}" stroke="#38BDF8" stroke-width="0.5"/>')
    for y_grid in range(int(min_y), int(max_y), 100):
        svg.append(f'    <line x1="{min_x}" y1="{y_grid}" x2="{max_x}" y2="{y_grid}" stroke="#38BDF8" stroke-width="0.5"/>')
    svg.append('  </g>')

    node_map = {n["id"]: n for n in NODES_DEF}

    # Draw Edges
    svg.append('  <g id="edges">')
    for ed in EDGES_DEF:
        s_node = node_map.get(ed["s"])
        t_node = node_map.get(ed["t"])
        if not s_node or not t_node:
            continue
        
        sx = s_node["x"] + s_node["w"] / 2
        sy = s_node["y"] + s_node["h"] / 2
        tx = t_node["x"] + t_node["w"] / 2
        ty = t_node["y"] + t_node["h"] / 2

        color = ed.get("color", "#38BDF8")
        svg.append(f'    <line x1="{sx}" y1="{sy}" x2="{tx}" y2="{ty}" stroke="{color}" stroke-width="1.8" marker-end="url(#arrow)"/>')
        if "label" in ed and ed["label"]:
            mx = (sx + tx) / 2
            my = (sy + ty) / 2 - 5
            svg.append(f'    <text x="{mx}" y="{my}" class="edge-text">{ed["label"]}</text>')
    svg.append('  </g>')

    # Draw Nodes
    svg.append('  <g id="nodes">')
    for nd in NODES_DEF:
        x, y, w, h = nd["x"], nd["y"], nd["w"], nd["h"]
        fill = nd["fill"]
        border = nd["border"]
        is_bold = nd.get("is_bold", False)
        shape = nd.get("shape", "roundrectangle")

        if shape == "diamond":
            pts = f"{x + w/2},{y} {x + w},{y + h/2} {x + w/2},{y + h} {x},{y + h/2}"
            svg.append(f'    <polygon points="{pts}" fill="{fill}" stroke="{border}" stroke-width="2"/>')
        elif shape == "parallelogram":
            offset = 20
            pts = f"{x + offset},{y} {x + w},{y} {x + w - offset},{y + h} {x},{y + h}"
            svg.append(f'    <polygon points="{pts}" fill="{fill}" stroke="{border}" stroke-width="2"/>')
        else:
            svg.append(f'    <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" ry="10" fill="{fill}" stroke="{border}" stroke-width="2"/>')

        lines = nd["label"].split("\n")
        total_lines = len(lines)
        line_height = 14
        start_y = y + (h / 2) - ((total_lines - 1) * line_height / 2)

        font_weight = "bold" if is_bold else "normal"
        text_color = nd.get("text_color", "#FFFFFF")

        for idx, line in enumerate(lines):
            safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            svg.append(f'    <text x="{x + w/2}" y="{start_y + idx * line_height}" font-size="{nd.get("font_size", 11)}" font-weight="{font_weight}" fill="{text_color}" text-anchor="middle">{safe_line}</text>')

    svg.append('  </g>')
    svg.append('</svg>')
    return "\n".join(svg)

def main():
    base_dir = "/Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/diagrams"
    os.makedirs(base_dir, exist_ok=True)

    xml_content = generate_graphml()
    svg_content = generate_svg()

    graphml_path = os.path.join(base_dir, "OpenBusinessPlan_Master_Architecture.graphml")
    xml_path = os.path.join(base_dir, "OpenBusinessPlan_Master_Architecture.graphml.xml")
    svg_path = os.path.join(base_dir, "OpenBusinessPlan_Master_Architecture.svg")

    with open(graphml_path, "w", encoding="utf-8") as f:
        f.write(xml_content)

    with open(xml_path, "w", encoding="utf-8") as f:
        f.write(xml_content)

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    print(f"✅ Generados exitosamente en {base_dir}:")
    print(f"  - {os.path.basename(graphml_path)} (Nodos: {len(NODES_DEF)}, Aristas: {len(EDGES_DEF)})")
    print(f"  - {os.path.basename(xml_path)}")
    print(f"  - {os.path.basename(svg_path)}")

if __name__ == "__main__":
    main()
