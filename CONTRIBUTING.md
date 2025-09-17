# Contributing to MedCheck

Thank you for your interest in contributing to MedCheck! We welcome contributions from developers of all skill levels. This guide will help you get started with contributing to our drug interaction checker project.

## 🎯 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Security Considerations](#security-considerations)

## 📋 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 How to Contribute

### Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Implement features or fix bugs
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve test coverage
- **Translation**: Help translate the interface (future feature)

### Good First Issues

Look for issues labeled with:
- `good first issue` - Perfect for newcomers
- `documentation` - Documentation improvements
- `help wanted` - Community help needed
- `bug` - Bug fixes

## 🛠 Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- A code editor (VS Code recommended)

### Local Development

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/medication.git
   cd medication/med-tracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to `http://localhost:5173`
   - The app should reload automatically when you make changes

### Environment Variables

No API keys are required for development as the app uses public APIs. However, you may want to create a `.env` file for any future environment-specific configurations.

## 📁 Project Structure

```
med-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable components
│   │   ├── interactions/   # Interaction-related components
│   │   ├── layout/         # Layout components
│   │   └── medication/     # Medication-related components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   │   ├── rxnorm.js      # RxNorm API integration
│   │   ├── openfdaInteractions.js  # OpenFDA API
│   │   └── indianMedicine.js       # Indian medicine database
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public assets
└── docs/                   # Documentation files
```

### Key Files to Understand

- **`src/App.jsx`**: Main application component
- **`src/hooks/useMedications.js`**: Core medication management logic
- **`src/services/`**: All external API integrations
- **`src/context/MedicationContext.jsx`**: Global state management

## 📝 Coding Standards

### General Guidelines

- **Follow existing patterns**: Maintain consistency with existing code
- **Component structure**: Use functional components with hooks
- **Naming conventions**: Use camelCase for variables and functions, PascalCase for components
- **File naming**: Use PascalCase for component files, camelCase for others

### React Best Practices

```javascript
// ✅ Good - Functional component with proper hooks
import React, { useState, useEffect } from 'react';

export default function MedicationCard({ medication, onRemove }) {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Effect logic here
  }, [medication]);
  
  return (
    <div className="medication-card">
      {/* Component JSX */}
    </div>
  );
}

// ❌ Avoid - Class components (unless necessary)
class MedicationCard extends React.Component {
  // Class component code
}
```

### API Service Guidelines

```javascript
// ✅ Good - Proper error handling and async/await
export class APIService {
  async fetchData(params) {
    try {
      const response = await fetch(`${BASE_URL}/endpoint`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}
```

### CSS/Styling Guidelines

- **Use Tailwind CSS**: Prefer utility classes over custom CSS
- **Responsive design**: Ensure mobile compatibility
- **Accessibility**: Include proper ARIA labels and semantic HTML

```jsx
// ✅ Good - Tailwind with accessibility
<button 
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
  aria-label="Add medication to list"
  onClick={handleAddMedication}
>
  Add Medication
</button>
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test component interactions
- **API tests**: Mock external API calls

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```javascript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import MedicationSearch from '../MedicationSearch';

describe('MedicationSearch', () => {
  test('should render search input', () => {
    render(<MedicationSearch />);
    expect(screen.getByPlaceholderText(/search medications/i)).toBeInTheDocument();
  });
  
  test('should call onSearch when typing', () => {
    const mockOnSearch = jest.fn();
    render(<MedicationSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search medications/i);
    fireEvent.change(input, { target: { value: 'aspirin' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('aspirin');
  });
});
```

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes**: Ensure all tests pass
2. **Lint your code**: Run `npm run lint` and fix any issues
3. **Update documentation**: If you've changed APIs or added features
4. **Check accessibility**: Test with screen readers if possible

### PR Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks**: CI/CD pipeline runs tests and linting
2. **Code review**: Maintainers review code quality and functionality
3. **Testing**: Manual testing of new features
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge preferred for clean history

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

### Feature Requests

Use the feature request template and include:

- **Problem statement**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought of
- **Additional context**: Mockups, examples, or research

## 🔒 Security Considerations

### Medical Data Sensitivity

- **No PHI**: Never commit personally identifiable health information
- **Public APIs only**: All APIs used are public and don't require authentication
- **Client-side only**: No server-side storage of user data
- **Disclaimers**: Maintain clear medical disclaimers

### Code Security

- **Dependencies**: Regularly update dependencies for security patches
- **Input validation**: Validate all user inputs
- **API security**: Respect rate limits and terms of service
- **Error handling**: Don't expose sensitive information in errors

### Reporting Security Issues

For security vulnerabilities, please email the maintainers directly rather than creating public issues.

## 🎨 Design Guidelines

### UI/UX Principles

- **Medical context**: Clean, professional appearance appropriate for healthcare
- **Clarity**: Information should be easily scannable and understandable
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-first**: Responsive design for all screen sizes

### Color Coding

- **Red/Danger**: Major interactions or critical warnings
- **Yellow/Warning**: Moderate interactions or cautions
- **Green/Success**: Safe combinations or confirmations
- **Blue/Info**: General information or neutral states

## 📚 Additional Resources

### Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [RxNorm API Documentation](https://rxnav.nlm.nih.gov/RxNormAPIREST.html)
- [OpenFDA API Documentation](https://open.fda.gov/apis/)

### Community

- **GitHub Discussions**: For questions and community interaction
- **Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions

## 📞 Getting Help

If you need help or have questions:

1. **Check existing issues**: Your question might already be answered
2. **GitHub Discussions**: Start a discussion for general questions
3. **Documentation**: Review the README and this contributing guide
4. **Code comments**: Many complex functions have detailed comments

---

Thank you for contributing to MedCheck! Your efforts help make medication safety information more accessible to everyone.

**Remember**: This is a healthcare-related project. Always prioritize accuracy, safety, and clear communication in your contributions.
