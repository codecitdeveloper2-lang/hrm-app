import { useTheme } from '../../../styles/ThemeProvider';
import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {COLORS} from '../../../styles';

interface Column {
  key: string;
  title: string;
  width?: number;
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
  emptyMessage?: string;
}

export default function Table({columns, data, emptyMessage = 'No data available'}: TableProps) {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={styles.headerRow}>
          {columns.map((col) => (
            <View key={col.key} style={[styles.cell, col.width ? {width: col.width} : {flex: 1}]}>
              <Text style={styles.headerText}>{col.title}</Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {data.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          data.map((row, index) => (
            <View key={index} style={[styles.dataRow, index % 2 === 0 && styles.evenRow]}>
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, col.width ? {width: col.width} : {flex: 1}]}>
                  <Text style={styles.cellText}>{row[col.key]}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentGlow,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  evenRow: {
    backgroundColor: COLORS.inputBg,
  },
  cell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Object.keys(COLORS).length > 0 && COLORS.accent !== COLORS.accentLight ? COLORS.accentLight : COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cellText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  emptyRow: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
