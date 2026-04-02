import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Note: In a real app we'd load custom fonts here
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#070b14',
    padding: 40,
    color: '#f1f5f9',
    border: '20pt solid #00e5ff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    border: '2pt solid rgba(255,255,255,0.1)',
    position: 'relative',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#ffffff',
  },
  accent: {
    color: '#00e5ff',
  },
  title: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 20,
    color: '#94a3b8',
  },
  name: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
  text: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    width: '80%',
    lineHeight: 1.6,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00e5ff',
    marginBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  date: {
    fontSize: 10,
    color: '#64748b',
  },
  verifyId: {
    fontSize: 10,
    color: '#64748b',
  },
  signatureContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  signature: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
    borderBottom: '1pt solid #64748b',
    width: 150,
    textAlign: 'center',
  }
});

interface Props {
  userName: string;
  courseTitle: string;
  date: string;
  verifyId: string;
}

export const CertificatePDF = ({ userName, courseTitle, date, verifyId }: Props) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.brand}>THE<Text style={styles.accent}>QNEW</Text></Text>
        
        <Text style={styles.title}>Certificate of Completion</Text>
        
        <Text style={{ fontSize: 14, marginBottom: 10 }}>This is to certify that</Text>
        <Text style={styles.name}>{userName}</Text>
        
        <Text style={styles.text}>
          has successfully completed all requirements and assessments for the professional course:
        </Text>
        
        <Text style={styles.courseTitle}>{courseTitle}</Text>
        
        <View style={styles.signatureContainer}>
          <Text style={styles.signature}>Alas G.</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>CEO, THEQNEW</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>Issued on {date}</Text>
          <Text style={styles.verifyId}>Verification ID: {verifyId}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
