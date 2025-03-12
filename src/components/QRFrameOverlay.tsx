import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const frameSize = Math.min(width, height) * 0.7; // 70% del lado más corto de la pantalla
const cornerSize = frameSize * 0.1; // 10% del tamaño del frame

const QRFrameOverlay = () => (
  <View style={styles.qrFrame}>
    <View style={[styles.corner, styles.cornerTopLeft]} />
    <View style={[styles.corner, styles.cornerTopRight]} />
    <View style={[styles.corner, styles.cornerBottomLeft]} />
    <View style={[styles.corner, styles.cornerBottomRight]} />
  </View>
);

const styles = StyleSheet.create({
  qrFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
    borderColor: 'white',
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: (height - frameSize) / 2,
    left: (width - frameSize) / 2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: (height - frameSize) / 2,
    right: (width - frameSize) / 2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: (height - frameSize) / 2,
    left: (width - frameSize) / 2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: (height - frameSize) / 2,
    right: (width - frameSize) / 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
});

export default QRFrameOverlay;