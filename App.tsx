import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';
import Tts from 'react-native-tts';

function App(): React.JSX.Element {
  const backgroundStyle = {
    backgroundColor: Colors.lighter,
  };

  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [ebookContent, setEbookContent] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

    Tts.addEventListener('tts-start', (event) => setIsSpeaking(true));
    Tts.addEventListener('tts-finish', (event) => setIsSpeaking(false));
    Tts.addEventListener('tts-cancel', (event) => setIsSpeaking(false));

    return () => {
      Tts.removeEventListener('tts-start', (event) => setIsSpeaking(true));
      Tts.removeEventListener('tts-finish', (event) => setIsSpeaking(false));
      Tts.removeEventListener('tts-cancel', (event) => setIsSpeaking(false));
      Tts.stop();
    };
  }, []);

  const handleDocumentPick = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setImportedFileName(pickerResult.name);
      Alert.alert('File Imported', `Successfully imported: ${pickerResult.name}`);

      // For simplicity, we'll assume text files for now. Real parsing would be more complex.
      if (pickerResult.uri) {
        const content = await fetch(pickerResult.uri).then(res => res.text());
        setEbookContent(content);
      }

      console.log(pickerResult);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Cancelled', 'Document picking cancelled.');
      } else {
        Alert.alert('Error', 'Unknown error: ' + JSON.stringify(err));
        console.error(err);
      }
    }
  };

  const speakEbookContent = () => {
    if (ebookContent) {
      Tts.speak(ebookContent);
    } else {
      Alert.alert('No E-book', 'Please import an e-book first to use Text-to-Speech.');
    }
  };

  const stopSpeaking = () => {
    Tts.stop();
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Audiobook Player</Text>
        <View style={styles.playbackControls}>
          <Button title="Play" onPress={() => { /* Play logic */ }} accessibilityLabel="Play audiobook" />
          <Button title="Pause" onPress={() => { /* Pause logic */ }} accessibilityLabel="Pause audiobook" />
          <Button title="Skip Forward" onPress={() => { /* Skip forward logic */ }} accessibilityLabel="Skip forward 30 seconds" />
          <Button title="Skip Backward" onPress={() => { /* Skip backward 30 seconds */ }} accessibilityLabel="Skip backward 30 seconds" />
        </View>
        <View style={styles.importSection}>
          <Button title="Import E-book" onPress={handleDocumentPick} accessibilityLabel="Import e-book file" />
          {importedFileName && <Text style={styles.importedFileText} accessibilityLabel={`Currently imported file: ${importedFileName}`}>Imported: {importedFileName}</Text>}
          {ebookContent && (
            <View style={styles.ttsControls}>
              <Button
                title={isSpeaking ? "Stop Reading" : "Read E-book"}
                onPress={isSpeaking ? stopSpeaking : speakEbookContent}
                accessibilityLabel={isSpeaking ? "Stop reading e-book" : "Start reading e-book aloud"}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  importSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  importedFileText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.dark,
  },
  ttsControls: {
    marginTop: 20,
  },
});

export default App;


