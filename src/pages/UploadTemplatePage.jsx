import React, { useState, useRef, createRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  RotateCcw,
  RotateCw,
  Grid,
  FileBadge,
  Receipt,
  Mail,
  Maximize2,
  Minimize2,
  Sparkles,
  Settings,
  Type,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Check,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import {
  createCustomTemplate,
  getTemplate,
  updateCustomTemplate,
} from "../api";
import CustomTemplateEditor from "../components/CustomTemplateEditor";
import TextElementControls from "../components/TextElementControls";
import { SERVER_BASE_URL } from "../config";

// --- PLACEHOLDER CONFIGURATIONS ---
const CERTIFICATE_PLACEHOLDERS = [
  { name: "Recipient Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Course Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Issue Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Verification ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const RECEIPT_PLACEHOLDERS = [
  { name: "Payer Name", value: "{{recipient_name}}", defaultWidth: 300 },
  { name: "Total Amount", value: "{{amount}}", defaultWidth: 150 },
  { name: "Payment Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Description", value: "{{course_title}}", defaultWidth: 350 },
  { name: "Receipt / Txn ID", value: "{{verification_id}}", defaultWidth: 250 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Auth Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const INVITATION_PLACEHOLDERS = [
  { name: "Guest Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Event Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Event Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Venue / Location", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Event Time", value: "{{signature}}", defaultWidth: 200 },
  { name: "Ticket / RSVP ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Check-in QR Code", value: "{{qr_code}}", isQr: true },
];

// --- BACKGROUND PRESETS ---
const PRESET_TEMPLATES = [
  {
    name: "Classic Navy & Gold",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#fcfcfc" />
        <rect x="20" y="20" width="802" height="555" fill="none" stroke="#1e3a8a" stroke-width="6" />
        <rect x="32" y="32" width="778" height="531" fill="none" stroke="#d97706" stroke-width="2" />
        <path d="M 20 50 L 50 20 M 792 20 L 822 50 M 822 545 L 792 575 M 50 575 L 20 545" stroke="#d97706" stroke-width="2" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "Certificate of Completion", x: 221, y: 110, width: 400, height: 40, fontSize: 26, fontFamily: "Times New Roman", fill: "#1e3a8a", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "This is to certify that", x: 221, y: 165, width: 400, height: 25, fontSize: 13, fontFamily: "Times New Roman", fill: "#4B5EAA", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 121, y: 200, width: 600, height: 50, fontSize: 36, fontFamily: "Georgia", fill: "#111827", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "has successfully completed the course requirements for", x: 221, y: 265, width: 400, height: 25, fontSize: 13, fontFamily: "Times New Roman", fill: "#4b5eaa", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 121, y: 300, width: 600, height: 35, fontSize: 22, fontFamily: "Times New Roman", fill: "#d97706", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 100, y: 410, width: 180, height: 25, fontSize: 13, fontFamily: "Times New Roman", fill: "#1e293b", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Date of Issue", x: 100, y: 440, width: 180, height: 20, fontSize: 9, fontFamily: "Times New Roman", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 562, y: 410, width: 180, height: 25, fontSize: 15, fontFamily: "Georgia", fill: "#1e293b", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Authorized Signature", x: 562, y: 440, width: 180, height: 20, fontSize: 9, fontFamily: "Times New Roman", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 400, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Modern Emerald Forest",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#f8fafc" />
        <rect x="0" y="0" width="30" height="595" fill="#2563eb" />
        <circle cx="100" cy="80" r="22" fill="#facc15" opacity="0.8" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "Certificate of Completion", x: 160, y: 65, width: 500, height: 35, fontSize: 26, fontFamily: "Arial", fill: "#2563eb", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "This document is proudly presented to:", x: 160, y: 115, width: 500, height: 20, fontSize: 13, fontFamily: "Arial", fill: "#64748b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 160, y: 150, width: 550, height: 45, fontSize: 36, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "For successfully mastering the course curriculum and demonstrating competency in", x: 160, y: 215, width: 550, height: 40, fontSize: 13, fontFamily: "Arial", fill: "#64748b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 160, y: 265, width: 550, height: 30, fontSize: 20, fontFamily: "Arial", fill: "#2563eb", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 160, y: 380, width: 180, height: 25, fontSize: 12, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DATE OF ISSUANCE", x: 160, y: 410, width: 180, height: 20, fontSize: 9, fontFamily: "Arial", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 520, y: 380, width: 200, height: 25, fontSize: 15, fontFamily: "Arial", fill: "#1e293b", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "AUTHORIZED SIGNATURE", x: 520, y: 410, width: 200, height: 20, fontSize: 9, fontFamily: "Arial", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 375, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Corporate Receipt",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#ffffff" />
        <rect x="25" y="25" width="792" height="545" fill="none" stroke="#e2e8f0" stroke-width="2" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "PAYMENT RECEIPT", x: 50, y: 55, width: 300, height: 30, fontSize: 20, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issuer_name}}", x: 492, y: 55, width: 300, height: 20, fontSize: 13, fontFamily: "Arial", fill: "#64748b", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Receipt #: {{verification_id}}", x: 492, y: 80, width: 300, height: 20, fontSize: 10, fontFamily: "Arial", fill: "#94a3b8", align: "right", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DESCRIPTION", x: 50, y: 130, width: 500, height: 20, fontSize: 10, fontFamily: "Arial", fill: "#64748b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "AMOUNT", x: 592, y: 130, width: 200, height: 20, fontSize: 10, fontFamily: "Arial", fill: "#64748b", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 50, y: 165, width: 500, height: 35, fontSize: 13, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{amount}}", x: 592, y: 165, width: 200, height: 35, fontSize: 15, fontFamily: "Arial", fill: "#1e293b", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "TOTAL PAID:", x: 450, y: 235, width: 140, height: 25, fontSize: 13, fontFamily: "Arial", fill: "#64748b", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{amount}}", x: 592, y: 235, width: 200, height: 25, fontSize: 16, fontFamily: "Arial", fill: "#2563eb", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "RECEIVED FROM:", x: 50, y: 310, width: 200, height: 20, fontSize: 9, fontFamily: "Arial", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 50, y: 335, width: 350, height: 25, fontSize: 13, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "TRANSACTION DATE:", x: 50, y: 380, width: 200, height: 20, fontSize: 9, fontFamily: "Arial", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 50, y: 405, width: 200, height: 25, fontSize: 13, fontFamily: "Arial", fill: "#1e293b", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 592, y: 360, width: 200, height: 30, fontSize: 16, fontFamily: "Arial", fill: "#1e293b", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "AUTHORIZED SIGNATURE", x: 592, y: 395, width: 200, height: 20, fontSize: 9, fontFamily: "Arial", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 420, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Elegant Crimson",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#fafaf9" />
        <rect x="25" y="25" width="792" height="545" fill="none" stroke="#27272a" stroke-width="1.5" />
        <rect x="30" y="30" width="782" height="535" fill="none" stroke="#991b1b" stroke-width="0.5" stroke-dasharray="8,4" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "Certificate of Completion", x: 171, y: 95, width: 500, height: 40, fontSize: 32, fontFamily: "Playfair Display", fill: "#1f2937", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "This certifies that", x: 221, y: 150, width: 400, height: 25, fontSize: 14, fontFamily: "Georgia", fill: "#991b1b", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 121, y: 185, width: 600, height: 45, fontSize: 36, fontFamily: "Playfair Display", fill: "#111827", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "has completed the required course of study and passed the final exam in", x: 171, y: 245, width: 500, height: 40, fontSize: 14, fontFamily: "Georgia", fill: "#374151", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 121, y: 295, width: 600, height: 35, fontSize: 22, fontFamily: "Playfair Display", fill: "#991b1b", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 150, y: 400, width: 180, height: 25, fontSize: 15, fontFamily: "Playfair Display", fill: "#1f2937", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "OFFICIAL SIGNATURE", x: 150, y: 430, width: 180, height: 20, fontSize: 8, fontFamily: "Georgia", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 512, y: 400, width: 180, height: 25, fontSize: 13, fontFamily: "Playfair Display", fill: "#1f2937", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DATE OF AWARD", x: 512, y: 430, width: 180, height: 20, fontSize: 8, fontFamily: "Georgia", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 395, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Modern Landscape",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <defs>
          <linearGradient id="modernGrad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="842" height="595" fill="#ffffff" />
        <path d="M 450 0 L 842 0 L 842 350 Z" fill="url(#modernGrad)" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "PRO CERTIFIED", x: 50, y: 55, width: 300, height: 30, fontSize: 22, fontFamily: "Montserrat", fill: "#4f46e5", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Date: {{issue_date}}", x: 492, y: 55, width: 300, height: 25, fontSize: 12, fontFamily: "Montserrat", fill: "#4f46e5", align: "right", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "This document verifies that", x: 50, y: 115, width: 500, height: 20, fontSize: 13, fontFamily: "Montserrat", fill: "#64748b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 50, y: 145, width: 600, height: 45, fontSize: 36, fontFamily: "Montserrat", fill: "#111827", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "has successfully completed and demonstrated proficiency in", x: 50, y: 210, width: 600, height: 35, fontSize: 13, fontFamily: "Montserrat", fill: "#64748b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 50, y: 255, width: 600, height: 30, fontSize: 20, fontFamily: "Montserrat", fill: "#4f46e5", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 492, y: 380, width: 300, height: 25, fontSize: 15, fontFamily: "Montserrat", fill: "#111827", align: "right", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "AUTHORIZED SIGNATURE", x: 492, y: 410, width: 300, height: 20, fontSize: 9, fontFamily: "Montserrat", fill: "#94a3b8", align: "right", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "ID: {{verification_id}} | Verified Secure", x: 50, y: 395, width: 300, height: 20, fontSize: 9, fontFamily: "Montserrat", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 380, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Minimalist Bold",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#ffffff" />
        <rect x="0" y="0" width="70" height="595" fill="#111827" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "VERIFICATION ID: {{verification_id}}", x: 10, y: 410, width: 300, height: 30, fontSize: 9, fontFamily: "Montserrat", fill: "#94a3b8", align: "left", fontStyle: "bold", rotation: -90, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "CERTIFICATE", x: 130, y: 70, width: 500, height: 45, fontSize: 40, fontFamily: "Montserrat", fill: "#111827", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "OF COMPLETION", x: 130, y: 120, width: 500, height: 25, fontSize: 16, fontFamily: "Montserrat", fill: "#94a3b8", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "PROUDLY PRESENTED TO", x: 130, y: 185, width: 500, height: 20, fontSize: 10, fontFamily: "Montserrat", fill: "#94a3b8", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 130, y: 210, width: 550, height: 40, fontSize: 30, fontFamily: "Montserrat", fill: "#111827", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "For completing the academic program and achieving proficiency in {{course_title}}.", x: 130, y: 270, width: 550, height: 35, fontSize: 12, fontFamily: "Montserrat", fill: "#64748b", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 130, y: 360, width: 150, height: 25, fontSize: 14, fontFamily: "Montserrat", fill: "#111827", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "SIGNATURE", x: 130, y: 390, width: 150, height: 20, fontSize: 8, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 300, y: 360, width: 150, height: 25, fontSize: 12, fontFamily: "Montserrat", fill: "#111827", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DATE OF AWARD", x: 300, y: 390, width: 150, height: 20, fontSize: 8, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 480, y: 350, width: 55, height: 55, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Corporate Blue",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#f8fafc" />
        <rect x="0" y="0" width="842" height="15" fill="#1e3a8a" />
        <rect x="0" y="580" width="842" height="15" fill="#1e3a8a" />
        <path d="M 0 0 L 150 0 L 0 150 Z" fill="#3b82f6" opacity="0.3" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "CERTIFICATE OF ACHIEVEMENT", x: 171, y: 70, width: 500, height: 35, fontSize: 26, fontFamily: "Montserrat", fill: "#1e3a8a", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "This certificate is awarded to", x: 171, y: 110, width: 500, height: 20, fontSize: 12, fontFamily: "Montserrat", fill: "#64748b", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 121, y: 145, width: 600, height: 40, fontSize: 32, fontFamily: "Montserrat", fill: "#111827", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "in recognition of successful completion and fulfillment of the requirements for", x: 171, y: 205, width: 500, height: 40, fontSize: 13, fontFamily: "Montserrat", fill: "#64748b", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 121, y: 260, width: 600, height: 30, fontSize: 20, fontFamily: "Montserrat", fill: "#1e3a8a", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{issue_date}}", x: 150, y: 380, width: 180, height: 25, fontSize: 12, fontFamily: "Montserrat", fill: "#111827", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Date of Issue", x: 150, y: 410, width: 180, height: 20, fontSize: 9, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 512, y: 380, width: 180, height: 25, fontSize: 14, fontFamily: "Montserrat", fill: "#111827", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Authorized Signatory", x: 512, y: 410, width: 180, height: 20, fontSize: 9, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 380, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Tech Dark",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#0f172a" />
        <rect x="0" y="0" width="10" height="595" fill="#06b6d4" />
        <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#06b6d4" opacity="0.15" />
        </pattern>
        <rect width="842" height="595" fill="url(#dotPattern)" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: ">> SYSTEM VALIDATION SECURE", x: 50, y: 50, width: 300, height: 20, fontSize: 10, fontFamily: "Courier New", fill: "#06b6d4", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "CERTIFICATE OF COMPLETION", x: 50, y: 80, width: 600, height: 40, fontSize: 30, fontFamily: "Courier New", fill: "#06b6d4", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "HASH: 8f2a9c...1b4 | BLOCK: #9921 | VERIFIED", x: 50, y: 130, width: 600, height: 20, fontSize: 9, fontFamily: "Courier New", fill: "#475569", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Is hereby granted to:", x: 50, y: 185, width: 500, height: 20, fontSize: 12, fontFamily: "Courier New", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 50, y: 215, width: 500, height: 40, fontSize: 26, fontFamily: "Courier New", fill: "#ffffff", align: "left", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "For successful execution and passing validation parameters in the course: {{course_title}}", x: 50, y: 275, width: 550, height: 45, fontSize: 12, fontFamily: "Courier New", fill: "#94a3b8", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DATE: {{issue_date}}", x: 50, y: 390, width: 200, height: 25, fontSize: 11, fontFamily: "Courier New", fill: "#06b6d4", align: "left", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{signature}}", x: 430, y: 390, width: 200, height: 25, fontSize: 13, fontFamily: "Courier New", fill: "#ffffff", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "AUTOMATED SIGNATURE", x: 430, y: 420, width: 200, height: 20, fontSize: 9, fontFamily: "Courier New", fill: "#475569", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 680, y: 380, width: 60, height: 60, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  },
  {
    name: "Gala Invitation",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#1e1b4b" />
        <rect x="25" y="25" width="792" height="545" fill="none" stroke="#f59e0b" stroke-width="2" />
        <rect x="35" y="35" width="772" height="525" fill="none" stroke="#f59e0b" stroke-width="0.75" />
        <path d="M 25 55 L 55 25 M 787 25 L 817 55 M 817 540 L 787 570 M 55 570 L 25 540" stroke="#f59e0b" stroke-width="2" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
    elements: [
      { type: "placeholder", text: "YOU ARE CORDIALLY INVITED TO", x: 171, y: 80, width: 500, height: 25, fontSize: 13, fontFamily: "Montserrat", fill: "#f59e0b", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{course_title}}", x: 121, y: 125, width: 600, height: 45, fontSize: 32, fontFamily: "Playfair Display", fill: "#ffffff", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Special Guest Invitation for:", x: 171, y: 195, width: 500, height: 20, fontSize: 11, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "italic", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{recipient_name}}", x: 121, y: 235, width: 600, height: 38, fontSize: 26, fontFamily: "Playfair Display", fill: "#f59e0b", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "VENUE: {{issuer_name}}", x: 121, y: 310, width: 600, height: 25, fontSize: 13, fontFamily: "Montserrat", fill: "#ffffff", align: "center", fontStyle: "bold", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "DATE: {{issue_date}} | TIME: {{signature}}", x: 121, y: 350, width: 600, height: 25, fontSize: 11, fontFamily: "Montserrat", fill: "#94a3b8", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "Ticket #: {{verification_id}}", x: 121, y: 395, width: 600, height: 20, fontSize: 9, fontFamily: "Montserrat", fill: "#4b5563", align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: false },
      { type: "placeholder", text: "{{qr_code}}", x: 396, y: 440, width: 50, height: 50, align: "center", fontStyle: "normal", rotation: 0, verticalAlign: "middle", isQr: true }
    ]
  }
];

const DraggablePlaceholder = ({ placeholder }) => (
  <div
    draggable
    className="text-[11px] bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-sm text-gray-700 p-2.5 rounded-lg cursor-grab active:cursor-grabbing mb-2 transition-all flex items-center justify-between group select-none"
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(placeholder));
    }}
  >
    <span className="font-semibold group-hover:text-indigo-600">
      {placeholder.name}
    </span>
    <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 font-mono">
      {placeholder.value.replace(/[{}]/g, "")}
    </span>
  </div>
);

const UploadTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateType, setTemplateType] = useState("certificate"); // 'certificate', 'receipt', or 'invitation'
  const [templateImageFile, setTemplateImageFile] = useState(null);
  const [templateImageUrl, setTemplateImageUrl] = useState(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 842, height: 595 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomScale, setZoomScale] = useState(0.75); // Compact visual scaling
  const [leftTab, setLeftTab] = useState("variables"); // "variables" or "presets"
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  
  const fileInputRef = useRef(null);
  const stageRef = createRef();
  const workspaceRef = useRef(null);
  const [zoomMode, setZoomMode] = useState("fit"); // 'fit' or 'manual'

  const handleFitScreen = useCallback(() => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const padding = 64; // horizontal & vertical padding (p-8 = 32px on each side = 64px total)
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / canvasSize.width;
    const scaleY = availableHeight / canvasSize.height;

    let fitScale = Math.min(scaleX, scaleY);
    // Round to 2 decimal places and clamp between 0.25 and 2.0
    fitScale = Math.max(0.25, Math.min(2.0, Math.round(fitScale * 100) / 100));

    setZoomScale(fitScale);
  }, [canvasSize]);

  // Auto-fit on background load or initial template fetch
  useEffect(() => {
    if (templateImageUrl) {
      const timer = setTimeout(() => {
        handleFitScreen();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [templateImageUrl, handleFitScreen]);

  // Recalculate zoom when sidebars toggle, if in 'fit' mode
  useEffect(() => {
    if (zoomMode === "fit") {
      const timer = setTimeout(() => {
        handleFitScreen();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLeftSidebarOpen, isRightSidebarOpen, zoomMode, handleFitScreen]);

  // Handle window resizing, if in 'fit' mode
  useEffect(() => {
    const handleResize = () => {
      if (zoomMode === "fit") {
        handleFitScreen();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [zoomMode, handleFitScreen]);

  // --- Keyboard Shortcuts for Toggling Sidebars ---
  useEffect(() => {
    const handleShortcutKeyDown = (e) => {
      // Don't trigger if typing in an input, textarea, or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      if (e.key === "[") {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      } else if (e.key === "]") {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
      } else if (e.key === "\\") {
        e.preventDefault();
        // Toggle both sidebars
        if (isLeftSidebarOpen || isRightSidebarOpen) {
          setIsLeftSidebarOpen(false);
          setIsRightSidebarOpen(false);
        } else {
          setIsLeftSidebarOpen(true);
          setIsRightSidebarOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleShortcutKeyDown);
    return () => window.removeEventListener("keydown", handleShortcutKeyDown);
  }, [isLeftSidebarOpen, isRightSidebarOpen]);

  useEffect(() => {
    if (templateId) {
      const fetchTemplateData = async () => {
        try {
          const response = await getTemplate(templateId);
          const { title, layout_data } = response.data;
          setTemplateTitle(title);

          if (layout_data) {
            if (layout_data.type) setTemplateType(layout_data.type);

            const loadedElements = (layout_data.elements || []).map(
              (el, index) => ({
                ...el,
                id:
                  el.id ||
                  `el_${Math.random().toString(36).substring(2, 11)}_${index}`,
              })
            );
            setElements(loadedElements);
            setCanvasSize(layout_data.canvas || { width: 842, height: 595 });
            if (layout_data.background?.image) {
              setTemplateImageUrl(
                layout_data.background.image.startsWith("data:")
                  ? layout_data.background.image
                  : `${SERVER_BASE_URL}${layout_data.background.image}`
              );
            }
            setHistory([loadedElements]);
            setCurrentStep(0);
          }
        } catch (error) {
          toast.error("Failed to load template data.");
          navigate("/dashboard/templates");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplateData();
    }
  }, [templateId, navigate]);

  useEffect(() => {
    if (!isLoadingHistory) {
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(elements);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      setIsLoadingHistory(false);
    }
  }, [elements]);

  const handleUndo = () => {
    if (currentStep > 0) {
      setIsLoadingHistory(true);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setElements(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setIsLoadingHistory(true);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setElements(history[nextStep]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const canvasWidth = 842;
          const canvasHeight = canvasWidth / aspectRatio;
          setCanvasSize({ width: canvasWidth, height: canvasHeight });
          setTemplateImageUrl(event.target.result);
          setTemplateImageFile(file);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid PNG or JPG image.");
    }
  };

  const handleSelectPreset = (preset) => {
    setTemplateImageUrl(preset.url);
    setTemplateImageFile(null);
    setCanvasSize(preset.canvasSize || { width: 842, height: 595 });
    if (preset.elements) {
      const elementsWithIds = preset.elements.map((el, index) => ({
        ...el,
        id: `el_preset_${preset.name.replace(/\s+/g, "").toLowerCase()}_${index}_${Math.random().toString(36).substring(2, 6)}`
      }));
      setElements(elementsWithIds);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition();
    const placeholder = JSON.parse(e.dataTransfer.getData("text/plain"));

    const defaultWidth = placeholder.defaultWidth || 250;
    const isQr = placeholder.isQr || false;

    // Adjust coordinates by dividing with zoomScale
    const dropX = pos.x / zoomScale;
    const dropY = pos.y / zoomScale;

    const newElement = {
      id: `el_${Math.random().toString(36).substring(2, 11)}`,
      type: "placeholder",
      text: placeholder.value,
      x: dropX - defaultWidth / 2,
      y: dropY - 15,
      width: defaultWidth,
      height: 30,
      fontSize: 20,
      fontFamily: "Times New Roman",
      fill: "#000000",
      align: isQr ? "center" : "left",
      fontStyle: "normal",
      rotation: 0,
      verticalAlign: "middle",
      isQr,
    };

    if (isQr) {
      newElement.x = dropX - 50;
      newElement.y = dropY - 50;
      newElement.width = 100;
      newElement.height = 100;
    }

    setElements([...elements, newElement]);
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim())
      return toast.error("Please provide a title for your template.");
    if (!templateImageUrl)
      return toast.error("Please select a background design or upload one.");
    if (elements.length === 0)
      return toast.error("Please add at least one placeholder element.");

    setIsSubmitting(true);
    const layoutData = {
      type: templateType,
      canvas: canvasSize,
      elements: elements.map((el) => ({
        id: el.id,
        type: "placeholder",
        text: el.text,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fill: el.fill,
        align: el.align,
        fontStyle: el.fontStyle,
        rotation: el.rotation,
        verticalAlign: el.verticalAlign,
        isQr: el.isQr,
      })),
    };

    if (!templateImageFile && templateImageUrl) {
      const relativePath = templateImageUrl.startsWith("data:")
        ? templateImageUrl
        : templateImageUrl.replace(SERVER_BASE_URL, "");
      layoutData.background = { image: relativePath };
    }

    const formData = new FormData();
    formData.append("title", templateTitle);
    formData.append("layout_data", JSON.stringify(layoutData));
    if (templateImageFile) {
      formData.append("template_image", templateImageFile);
    }

    const promise = templateId
      ? updateCustomTemplate(templateId, formData)
      : createCustomTemplate(formData);

    toast.promise(promise, {
      loading: templateId ? "Updating template..." : "Saving template...",
      success: () => {
        setTimeout(() => navigate("/dashboard/templates"), 1500);
        return `Template ${templateId ? "updated" : "saved"} successfully!`;
      },
      error: (err) => err.response?.data?.msg || `Failed to save template.`,
    });
    promise.finally(() => setIsSubmitting(false));
  };

  const selectedElement = elements.find((el) => el.id === selectedId);
  const activePlaceholders =
    templateType === "receipt"
      ? RECEIPT_PLACEHOLDERS
      : templateType === "invitation"
      ? INVITATION_PLACEHOLDERS
      : CERTIFICATE_PLACEHOLDERS;

  return (
    <div className="h-full flex flex-col font-sans bg-gray-50 text-gray-800">
      <Toaster position="top-center" />
      
      {/* --- TOP HEADER --- */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-50 h-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-5 w-px bg-gray-200"></div>
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            placeholder="Untitled Custom Template"
            className="text-sm font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-56"
          />
        </div>

        {/* Header Toolbar */}
        <div className="flex items-center gap-2">
          {/* Template Type Selector */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex text-xs font-semibold mr-2 border border-gray-200/50">
            <button
              onClick={() => setTemplateType("certificate")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "certificate"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileBadge size={14} /> Certificate
            </button>
            <button
              onClick={() => setTemplateType("receipt")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "receipt"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Receipt size={14} /> Receipt
            </button>
            <button
              onClick={() => setTemplateType("invitation")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "invitation"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mail size={14} /> Invitation
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md transition-colors border ${
              showGrid
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
            title="Toggle Grid"
          >
            <Grid size={14} />
          </button>

          <div className="h-5 w-px bg-gray-200 mx-1"></div>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={currentStep <= 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-1.5 rounded-md hover:bg-gray-100 border border-transparent"
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-1.5 rounded-md hover:bg-gray-100 border border-transparent"
            title="Redo"
          >
            <RotateCw size={14} />
          </button>

          <div className="h-5 w-px bg-gray-200 mx-1"></div>

          {/* Save Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 rounded-lg flex items-center gap-1.5 disabled:opacity-70 shadow-sm transition-all ml-1 text-xs cursor-pointer"
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" style={{ width: 12, height: 12 }} />
            ) : (
              <Save size={14} />
            )}
            <span>Save Design</span>
          </button>
        </div>
      </header>

      {/* --- THREE-COLUMN EDITOR GRID --- */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* 1. LEFT SIDEBAR: Variables & Background Presets */}
        {isLeftSidebarOpen && (
          <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-200">
          {/* Tab Headers */}
          <div className="grid grid-cols-3 border-b border-gray-100 p-1.5 gap-1 bg-gray-50/50">
            <button
              onClick={() => setLeftTab("variables")}
              className={`py-1 px-1 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                leftTab === "variables"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setLeftTab("presets")}
              className={`py-1 px-1 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                leftTab === "presets"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setLeftTab("layers")}
              className={`py-1 px-1 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                leftTab === "layers"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Layers
            </button>
          </div>

          {/* Left Panel Scrollable Area */}
          <div className="flex-grow overflow-y-auto p-3">
            {isLoading ? (
              <div className="text-center py-10">
                <Spinner variant="primary" size="sm" />
              </div>
            ) : leftTab === "variables" ? (
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Drag elements onto canvas
                </p>
                <div className="space-y-1">
                  {activePlaceholders.map((p) => (
                    <DraggablePlaceholder key={p.value} placeholder={p} />
                  ))}
                </div>
              </div>
            ) : leftTab === "presets" ? (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Select background preset
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_TEMPLATES.map((preset) => {
                    const isSelected = templateImageUrl === preset.url;
                    return (
                      <div
                        key={preset.name}
                        onClick={() => handleSelectPreset(preset)}
                        className={`
                          group relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md flex flex-col
                          ${isSelected 
                            ? "border-indigo-600 scale-[1.01]" 
                            : "border-slate-100 hover:border-indigo-300"
                          }
                        `}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 z-10 bg-indigo-600 text-white p-0.5 rounded-full shadow-xs animate-in fade-in zoom-in duration-200">
                            <Check size={8} strokeWidth={3} />
                          </div>
                        )}

                        {/* Preview Area */}
                        <div className="w-full relative pointer-events-none select-none overflow-hidden border-b border-slate-100 bg-white aspect-[1.414/1] shrink-0">
                          <div
                            className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none"
                            style={{
                              backgroundImage: `url("${preset.url}")`,
                              backgroundSize: "cover",
                            }}
                          />
                          {/* Hover overlay */}
                          <div className={`absolute inset-0 bg-indigo-900/0 transition-colors duration-300 ${isSelected ? "bg-indigo-900/5" : "group-hover:bg-indigo-900/5"}`} />
                        </div>

                        {/* Label */}
                        <div className={`
                          py-1.5 px-1 text-center text-[10px] font-bold tracking-wide transition-colors duration-300 flex-grow flex items-center justify-center
                          ${isSelected 
                            ? "bg-indigo-50 text-indigo-700" 
                            : "bg-white text-slate-600 group-hover:text-indigo-600"
                          }
                        `}>
                          {preset.name.replace("Modern ", "").replace("Classic ", "").toLowerCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 my-3 pt-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Custom Upload
                  </p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center p-3 border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-lg cursor-pointer hover:bg-indigo-50/20 transition-all group"
                  >
                    <UploadCloud size={16} className="text-gray-400 group-hover:text-indigo-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-gray-600 block">Upload Design</span>
                    <span className="text-[8px] text-gray-400">PNG/JPG (A4 horizontal)</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Canvas Layers
                </p>
                {elements.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No elements added yet.</p>
                ) : (
                  <div className="space-y-1">
                    {elements.map((el) => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                          selectedId === el.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-sm"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="truncate flex-1 pr-2 select-none">
                          {el.isQr ? "QR Code" : el.text.replace(/[{}]/g, "")}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setElements(elements.filter((item) => item.id !== el.id));
                            if (selectedId === el.id) setSelectedId(null);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Delete Layer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick upload bottom bar if background is loaded */}
          {templateImageUrl && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                {templateImageFile ? templateImageFile.name : "Custom Background"}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[9px] text-indigo-600 font-bold hover:underline"
              >
                Change
              </button>
            </div>
          )}
          </aside>
        )}

        {/* 2. CENTER AREA: Canvas Viewport & Zoom Controller */}
        <main
          className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Zoom controls / canvas sub-header */}
          <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors border ${
                  isLeftSidebarOpen ? "border-transparent" : "border-gray-200 bg-gray-50"
                }`}
                title={isLeftSidebarOpen ? "Collapse Left Panel (Press '[')" : "Expand Left Panel (Press '[')"}
              >
                {isLeftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
              <span className="text-[10px] font-semibold text-gray-500">
                Canvas: {canvasSize.width} x {canvasSize.height} px
              </span>
            </div>

            {/* Zoom Slider / Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setZoomScale(Math.max(0.25, zoomScale - 0.1));
                  setZoomMode("manual");
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              
              <div className="relative flex items-center">
                <select
                  value={zoomMode === "fit" ? "fit" : Math.round(zoomScale * 100)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "fit") {
                      setZoomMode("fit");
                      handleFitScreen();
                    } else {
                      setZoomScale(parseInt(val, 10) / 100);
                      setZoomMode("manual");
                    }
                  }}
                  className="text-[10px] font-bold text-gray-600 border border-gray-200 rounded pl-1.5 pr-4 py-0.5 bg-white cursor-pointer focus:outline-none h-6 appearance-none"
                >
                  <option value="fit">Fit Screen</option>
                  {[50, 75, 100, 125, 150].map((v) => (
                    <option key={v} value={v}>
                      {v}%
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[7px]">
                  ▼
                </span>
              </div>

              <button
                onClick={() => {
                  setZoomScale(Math.min(2.0, zoomScale + 0.1));
                  setZoomMode("manual");
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>

              <button
                onClick={() => {
                  setZoomMode("fit");
                  handleFitScreen();
                }}
                className={`p-1 hover:bg-gray-100 rounded transition-colors border flex items-center gap-1 px-1.5 h-6 cursor-pointer ${
                  zoomMode === "fit"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
                title="Fit Canvas to Workspace (Press '\' to collapse sidebars)"
              >
                <Maximize2 size={11} />
                <span className="text-[9px] font-bold">Fit</span>
              </button>

              <div className="h-4 w-px bg-gray-200 mx-0.5"></div>

              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors border ${
                  isRightSidebarOpen ? "border-transparent" : "border-gray-200 bg-gray-50"
                }`}
                title={isRightSidebarOpen ? "Collapse Right Panel (Press ']')" : "Expand Right Panel (Press ']')"}
              >
                {isRightSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>
          </div>

          {/* Interactive Workspace */}
          <div 
            ref={workspaceRef}
            className="flex-grow overflow-auto p-8 flex items-center justify-center bg-slate-200/60 pattern-grid relative"
          >
            {/* Floating border handles */}
            <button
              type="button"
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-slate-50 border border-l-0 border-slate-200 shadow-md rounded-r-md py-4 px-1 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center h-12 w-4"
            >
              {isLeftSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>

            <button
              type="button"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-slate-50 border border-r-0 border-slate-200 shadow-md rounded-l-md py-4 px-1 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center h-12 w-4"
            >
              {isRightSidebarOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {templateImageUrl ? (
              <div className="relative">
                <CustomTemplateEditor
                  stageRef={stageRef}
                  backgroundImageUrl={templateImageUrl}
                  elements={elements}
                  setElements={setElements}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  canvasSize={canvasSize}
                  showGrid={showGrid}
                  zoomScale={zoomScale}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 select-none pointer-events-none p-6 border border-dashed border-gray-300 rounded-2xl bg-white max-w-sm">
                <UploadCloud size={40} className="mx-auto text-indigo-500 opacity-60 mb-2.5" />
                <h5 className="text-xs font-bold text-gray-700">Canvas is Empty</h5>
                <p className="text-[10px] text-gray-400 mt-1">
                  Select a blank preset from the Left Panel or upload a custom design to begin designing your template.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR: Contextual Properties Panel */}
        {isRightSidebarOpen && (
          <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="p-3 border-b border-gray-100 flex items-center gap-1.5 bg-gray-50/50">
            <Settings size={14} className="text-gray-500" />
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Properties Panel</h4>
          </div>

          <div className="flex-grow p-3">
            {selectedElement ? (
              <TextElementControls
                element={selectedElement}
                onUpdate={(updatedAttrs) => {
                  if (updatedAttrs.arrange) {
                    const action = updatedAttrs.arrange;
                    let newElements = [...elements];
                    const index = newElements.findIndex((el) => el.id === selectedId);
                    if (index !== -1) {
                      const item = newElements[index];
                      newElements.splice(index, 1);
                      if (action === "front") {
                        newElements.push(item);
                      } else if (action === "back") {
                        newElements.unshift(item);
                      } else if (action === "forward") {
                        const targetIndex = Math.min(newElements.length, index + 1);
                        newElements.splice(targetIndex, 0, item);
                      } else if (action === "backward") {
                        const targetIndex = Math.max(0, index - 1);
                        newElements.splice(targetIndex, 0, item);
                      }
                      setElements(newElements);
                    }
                    return;
                  }
                  const updatedElements = elements.map((el) =>
                    el.id === selectedId ? { ...el, ...updatedAttrs } : el
                  );
                  setElements(updatedElements);
                }}
                onDelete={() => {
                  setElements(elements.filter((el) => el.id !== selectedId));
                  setSelectedId(null);
                }}
                onDone={() => setSelectedId(null)}
              />
            ) : (
              <div className="text-center py-16 text-gray-400 p-4 border border-dashed border-gray-100 rounded-xl">
                <Settings size={28} className="mx-auto opacity-20 mb-2 rotate-45" />
                <p className="text-[10px] font-bold text-gray-600">No Element Selected</p>
                <p className="text-[9px] text-gray-400 mt-1 leading-normal">
                  Click on any text variable or QR code on the canvas to configure fonts, colors, manual coordinates, alignments, and depths.
                </p>
              </div>
            )}
          </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default UploadTemplatePage;

