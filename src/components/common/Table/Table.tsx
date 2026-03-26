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

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  evenRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentLight,
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
