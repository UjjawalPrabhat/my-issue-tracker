import React from 'react';

/**
 * Enhanced tooltip component for recharts
 * @param {Object} props - Component props from recharts
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Data payload for tooltip
 * @param {string} props.label - Label for the data point
 * @param {function} props.formatter - Custom formatter function 
 * @param {string} props.title - Custom title for the tooltip
 */
const EnhancedTooltip = ({ active, payload, label, formatter, title }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Get custom formatted data or use default
  const formattedData = formatter ? 
    formatter(payload, label) : 
    payload.map(entry => ({
      name: entry.name,
      value: entry.value,
      color: entry.color || entry.stroke || '#8884d8'
    }));

  const tooltipTitle = title || label;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg text-sm">
      <div className="font-medium text-gray-900 mb-2">
        {tooltipTitle}
      </div>
      
      <div className="space-y-1">
        {formattedData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-700">{item.name}: </span>
            <span className="font-medium ml-1 text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedTooltip;
