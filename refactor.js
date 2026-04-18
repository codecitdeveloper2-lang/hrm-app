const fs = require('fs');

const files = [
  "c:\\projects\\hrm-app\\src\\pages\\Login\\LoginScreen.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Users\\UsersPage.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Reimbursement\\ReimbursementPage.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Schedule\\SchedulePage.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Profile\\ProfilePage.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Leave\\LeavePage.tsx",
  "c:\\projects\\hrm-app\\src\\pages\\Attendance\\AttendancePage.tsx",
  "c:\\projects\\hrm-app\\src\\components\\attendance\\AttendanceStats.tsx",
  "c:\\projects\\hrm-app\\src\\components\\layout\\Sidebar.tsx",
  "c:\\projects\\hrm-app\\src\\components\\layout\\SettingsOverlay.tsx",
  "c:\\projects\\hrm-app\\src\\components\\layout\\MainLayout.tsx",
  "c:\\projects\\hrm-app\\src\\components\\layout\\Header.tsx",
  "c:\\projects\\hrm-app\\src\\components\\layout\\DashboardLayout.tsx",
  "c:\\projects\\hrm-app\\src\\components\\dashboard\\WelcomeSection.tsx",
  "c:\\projects\\hrm-app\\src\\components\\dashboard\\StatCard.tsx",
  "c:\\projects\\hrm-app\\src\\components\\dashboard\\StatusCard.tsx",
  "c:\\projects\\hrm-app\\src\\components\\common\\Table\\Table.tsx",
  "c:\\projects\\hrm-app\\src\\components\\common\\Modal\\Modal.tsx",
  "c:\\projects\\hrm-app\\src\\components\\common\\LoadingSpinner\\LoadingSpinner.tsx",
  "c:\\projects\\hrm-app\\src\\App.tsx",
  "c:\\projects\\hrm-app\\src\\components\\common\\Button\\Button.tsx"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('COLORS')) continue;

  if (content.includes('import { useTheme }')) {
    continue; // already refactored
  }

  // 1. Remove COLORS from import { COLORS, globalStyles } from '../../styles';
  const importMatch = content.match(/import\s*\{([^}]*COLORS[^}]*)\}\s*from\s*['"]([^'"]+)['"]/);
  if (importMatch) {
    let vars = importMatch[1].split(',').map(s => s.trim()).filter(s => s !== 'COLORS').join(', ');
    if (vars) {
      content = content.replace(importMatch[0], `import { ${vars} } from '${importMatch[2]}'`);
    } else {
      content = content.replace(importMatch[0], ''); // remove fully
    }
  }

  // 2. Add useTheme import
  let importLevel = '';
  if (file.includes('pages\\')) importLevel = '../../styles/ThemeProvider';
  else if (file.includes('components\\layout\\')) importLevel = '../../styles/ThemeProvider';
  else if (file.includes('components\\dashboard\\')) importLevel = '../../styles/ThemeProvider';
  else if (file.includes('components\\attendance\\')) importLevel = '../../styles/ThemeProvider';
  else if (file.includes('components\\common\\')) importLevel = '../../../styles/ThemeProvider';
  else if (file.includes('App.tsx')) importLevel = './styles/ThemeProvider';
  else importLevel = '../../styles/ThemeProvider';

  content = `import { useTheme } from '${importLevel}';\n` + content;

  // 3. Transform const styles = StyleSheet.create({
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace('const styles = StyleSheet.create({', 'const getStyles = (COLORS: any) => StyleSheet.create({');
  } else if (content.includes('const styles = StyleSheet.create ( {')) {
    content = content.replace('const styles = StyleSheet.create ( {', 'const getStyles = (COLORS: any) => StyleSheet.create({');
  }

  // 4. Inject `const { colors: COLORS } = useTheme(); const styles = getStyles(COLORS);`
  // Handle default function
  const defFuncRegex = /export (default )?function ([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/;
  const defMatch = content.match(defFuncRegex);
  if (defMatch) {
    if (content.includes('getStyles(COLORS)')) {
      content = content.replace(defMatch[0], `${defMatch[0]}\n  const { colors: COLORS } = useTheme();\n  const styles = getStyles(COLORS);`);
    } else {
      content = content.replace(defMatch[0], `${defMatch[0]}\n  const { colors: COLORS } = useTheme();`);
    }
  } else {
    // Handle const Arrow
    const arrowRegex = /export const ([a-zA-Z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const arrMatch = content.match(arrowRegex);
    if (arrMatch) {
      if (content.includes('getStyles(COLORS)')) {
        content = content.replace(arrMatch[0], `${arrMatch[0]}\n  const { colors: COLORS } = useTheme();\n  const styles = getStyles(COLORS);`);
      } else {
        content = content.replace(arrMatch[0], `${arrMatch[0]}\n  const { colors: COLORS } = useTheme();`);
      }
    } else {
      // Just normal const Arrow
      const arrowRegex2 = /const ([a-zA-Z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*\{/;
      const arrMatch2 = content.match(arrowRegex2);
      if (arrMatch2) {
        if (content.includes('getStyles(COLORS)')) {
          content = content.replace(arrMatch2[0], `${arrMatch2[0]}\n  const { colors: COLORS } = useTheme();\n  const styles = getStyles(COLORS);`);
        } else {
          content = content.replace(arrMatch2[0], `${arrMatch2[0]}\n  const { colors: COLORS } = useTheme();`);
        }
      }
    }
  }

  // 5. Sometimes `SettingsOverlay` has `SettingItem` arrow components without braces.
  // Wait, I can handle SettingsOverlay manually later.
  // Fix React Component arrow functions without braces:
  // e.g. `const SettingItem = (...) => (\n` to `const SettingItem = (...) => { const {colors: COLORS} = useTheme(); return (\n`
  // Just manually fixing SettingsOverlay is better. Let's write the file.
  
  fs.writeFileSync(file, content);
}

console.log("Refactoring complete");
