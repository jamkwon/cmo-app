// Form Validation Utilities

export const ValidationService = {
  // Meeting data validation
  validateMeetingData: (data) => {
    const errors = {};
    const warnings = [];

    // Check for empty critical sections
    if (!data.bigWins?.trim()) {
      warnings.push('Consider adding big wins to celebrate client achievements');
    }

    if (!data.scorecard?.length) {
      warnings.push('Scorecard helps track progress - consider adding key metrics');
    }

    if (!data.newTodos?.length) {
      warnings.push('New to-dos help maintain momentum between meetings');
    }

    if (!data.meetingScore || data.meetingScore === 0) {
      warnings.push('Meeting score helps improve future sessions');
    }

    // Scorecard validation
    if (data.scorecard?.length > 0) {
      data.scorecard.forEach((metric, index) => {
        if (!metric.name?.trim()) {
          errors[`scorecard.${index}.name`] = 'Metric name is required';
        }
        if (!metric.goal || isNaN(metric.goal)) {
          errors[`scorecard.${index}.goal`] = 'Valid goal number required';
        }
        if (!metric.current || isNaN(metric.current)) {
          errors[`scorecard.${index}.current`] = 'Valid current value required';
        }
      });
    }

    // Campaign validation
    if (data.campaigns?.length > 0) {
      data.campaigns.forEach((campaign, index) => {
        if (!campaign.name?.trim()) {
          errors[`campaigns.${index}.name`] = 'Campaign name is required';
        }
        if (!campaign.status?.trim()) {
          errors[`campaigns.${index}.status`] = 'Campaign status is required';
        }
      });
    }

    // IDS validation (warn if incomplete)
    const idsComplete = !!(data.ids?.identify && data.ids?.discuss && data.ids?.solve);
    if (data.ids?.identify && !idsComplete) {
      warnings.push('Complete the IDS process: Identify → Discuss → Solve');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },

  // Client validation
  validateClient: (client) => {
    const errors = {};

    if (!client.name?.trim()) {
      errors.name = 'Client name is required';
    }

    if (!client.industry?.trim()) {
      errors.industry = 'Industry is required';
    }

    // Check for duplicate names (would need existing clients list)
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Meeting completeness score
  calculateCompleteness: (data) => {
    const sections = [
      { key: 'bigWins', weight: 15, check: () => !!data.bigWins?.trim() },
      { key: 'scorecard', weight: 20, check: () => data.scorecard?.length > 0 },
      { key: 'todoRecap', weight: 15, check: () => data.todoRecap?.length > 0 },
      { key: 'campaigns', weight: 15, check: () => data.campaigns?.length > 0 },
      { key: 'ids', weight: 20, check: () => !!(data.ids?.identify && data.ids?.discuss && data.ids?.solve) },
      { key: 'headlines', weight: 5, check: () => !!(data.headlines?.nextMeetingDate || data.headlines?.teamUpdates) },
      { key: 'newTodos', weight: 10, check: () => data.newTodos?.length > 0 }
    ];

    const completedWeight = sections.reduce((total, section) => {
      return total + (section.check() ? section.weight : 0);
    }, 0);

    return Math.round((completedWeight / 100) * 100);
  },

  // Input sanitization
  sanitize: {
    text: (value) => {
      if (typeof value !== 'string') return '';
      return value.trim().slice(0, 1000); // Prevent extremely long inputs
    },

    number: (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    },

    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value?.trim());
    }
  },

  // Real-time field validation
  validateField: (field, value, rules = {}) => {
    const errors = [];

    if (rules.required && (!value || !value.toString().trim())) {
      errors.push('This field is required');
    }

    if (rules.minLength && value?.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} characters required`);
    }

    if (rules.maxLength && value?.length > rules.maxLength) {
      errors.push(`Maximum ${rules.maxLength} characters allowed`);
    }

    if (rules.type === 'number' && value && isNaN(value)) {
      errors.push('Must be a valid number');
    }

    if (rules.type === 'email' && value && !ValidationService.sanitize.email(value)) {
      errors.push('Must be a valid email address');
    }

    if (rules.min && parseFloat(value) < rules.min) {
      errors.push(`Value must be at least ${rules.min}`);
    }

    if (rules.max && parseFloat(value) > rules.max) {
      errors.push(`Value must be no more than ${rules.max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default ValidationService;