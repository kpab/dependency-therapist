# 🏥 Dependency Therapist

**Is your project healthy?**

Dependency Therapist is an AI-powered analysis tool that diagnoses the health of Node.js project dependencies and visualizes technical debt.

Using a medical diagnosis metaphor, it makes dependency health status easy to understand and visualize.

## ✨ Features

- 🎯 **Overall Health Score**: Evaluate project dependencies with a 0-100 score
- 🔍 **Symptom Detection**: Automatically detect problematic packages
- 💊 **Prescriptions**: Suggest specific improvement strategies
- 📊 **Detailed Analysis**: Individual evaluation of freshness, security, complexity, maintainability, and performance
- 🌈 **Beautiful Reports**: Colorful and readable text reports
- 🚀 **CI/CD Ready**: Threshold checking and JSON output

## 📦 Installation

```bash
npm install -g dependency-therapist
```

Or run directly with npx:

```bash
npx dependency-therapist diagnose
```

## 🚀 Usage

### Basic Diagnosis

```bash
dependency-therapist diagnose
```

### Options

```bash
# Diagnose a specific project
dependency-therapist diagnose --path /path/to/project

# Show simple summary only
dependency-therapist diagnose --simple

# Output in JSON format
dependency-therapist diagnose --json
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Dependency Health Check
  run: |
    npx dependency-therapist diagnose --simple
```

Exits with code 1 if score is below 60.

## 📊 Sample Output

```
┌────────────────────────────────────────────────────────────────────┐
│ Project Health Diagnosis Report                                    │
│                                                                    │
│ Overall Health Score: 72/100 🟡 Needs Attention                   │
│                                                                    │
│ 📊 Detailed Scores:                                                │
│ ├─ Freshness: 45/100 🔴 ████████░░░░░░░░░░░░                      │
│ ├─ Security: 88/100 🟢 ██████████████████░░                       │
│ ├─ Complexity: 62/100 🟡 ████████████░░░░░░░░                     │
│ ├─ Maintainability: 71/100 🟡 ██████████████░░░░░░                │
│ └─ Performance: 80/100 🟢 ████████████████░░░░                    │
└────────────────────────────────────────────────────────────────────┘

📋 Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Dependencies: 45
Outdated Packages: 12
Deprecated Packages: 2
Average Age: 8 months
Detected Symptoms: 3

🏥 Detected Symptoms:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Severity: HIGH
Symptom: "Update Delay Syndrome"
Description: 12 packages are outdated (including 3 major updates)
Prescription:
  1. Check with npm outdated
  2. Implement gradual updates
  3. Review CHANGELOG for breaking changes
```

## 🎯 Scoring Criteria

### Overall Score
- 🟢 **80-100**: Healthy - Good condition
- 🟡 **60-79**: Needs Attention - Room for improvement
- 🔴 **0-59**: Unhealthy - Urgent action required

### Score Categories

- **Freshness**: Evaluates package recency
- **Security**: Deprecated packages and security risks
- **Complexity**: Number and complexity of dependencies
- **Maintainability**: Ease of maintenance
- **Performance**: Impact on build and runtime

## 🔍 Detected Symptoms

| Symptom | Description |
|---------|-------------|
| Zombie Package Infection | Deprecated or not updated for 2+ years |
| Update Delay Syndrome | Large number of outdated packages |
| Dependency Obesity | Too many dependencies (100+) |
| Version Conflict Syndrome | Different versions of the same package |
| Aging Syndrome | Average dependency age too high |

## 📚 API Usage Example

You can also use it programmatically:

```typescript
import { diagnose, generateReport } from 'dependency-therapist';

// Run diagnosis
const result = await diagnose('/path/to/project');

// Generate report
console.log(generateReport(result));

// Access scores
console.log(`Overall Score: ${result.score.overall}`);
console.log(`Symptoms: ${result.symptoms.length}`);
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Development mode
npm run dev
```

## 📈 Roadmap

### Phase 1 (MVP) - Completed ✅
- Basic scoring functionality
- Simple CLI
- Text-based reports

### Phase 2 - Planned
- Security vulnerability scanning (npm audit integration)
- HTML report generation
- Basic auto-fix functionality
- Detailed dependency graph

### Phase 3 - Planned
- AI recommendation engine
- Interactive visualization
- Failure prediction timeline
- Continuous monitoring

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

## 🙏 Acknowledgments

This project is inspired by the following tools and libraries:
- npm-check
- depcheck
- npm-outdated

---

**Stop worrying about dependencies.** 🏥

dependency-therapist serves as your project's primary physician, watching over your dependency health 24/7/365.
