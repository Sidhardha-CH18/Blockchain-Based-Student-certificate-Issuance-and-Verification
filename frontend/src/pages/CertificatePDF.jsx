import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4a5568',
  },
  studentInfo: {
    marginVertical: 25,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'semibold',
    color: '#1a365d',
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5,
  },
  academicSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  sgpaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sgpaItem: {
    width: '23%',
    marginBottom: 10,
    textAlign: 'center',
  },
  cgpa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2b6cb0',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signature: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#718096',
    paddingTop: 10,
  },
});

export const CertificatePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image src="/university-logo.png" style={styles.logo} />
        <Text style={styles.title}>Certificate of Academic Achievement</Text>
        <Text style={styles.subtitle}>This is to certify that</Text>
      </View>

      {/* Student Information */}
      <View style={styles.studentInfo}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.details}>
          Son/Daughter of {data.fatherName}
        </Text>
        <Text style={styles.details}>
          Born on {new Date(data.dob).toLocaleDateString()}
        </Text>
        <Text style={styles.details}>
          Student ID: {data.studentId}
        </Text>
      </View>

      {/* Academic Performance */}
      <View style={styles.academicSection}>
        <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
          Academic Performance
        </Text>
        
        <View style={styles.sgpaGrid}>
          {data.sgpa.map((sgpa, index) => (
            <View key={index} style={styles.sgpaItem}>
              <Text style={{ fontSize: 12, color: '#718096' }}>Sem {index + 1}</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{sgpa.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.cgpa}>
          Cumulative GPA: {data.cgpa.toFixed(2)} ({data.award})
        </Text>
      </View>

      {/* Footer Signatures */}
      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Date of Issue: {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.signature}>
          <Text>Registrar's Signature</Text>
          <Image src="/signature.png" style={{ width: 120, marginTop: 10 }} />
        </View>
      </View>
    </Page>
  </Document>
);