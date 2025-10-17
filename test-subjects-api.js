// Simple test to check subjects API
const testSubjectsAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/subjects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    console.log('Subjects API Response:', data);
    
    if (data.success && Array.isArray(data.data)) {
      console.log('✅ Subjects API working correctly');
      console.log('Number of subjects:', data.data.length);
    } else {
      console.log('❌ Unexpected response structure:', data);
    }
  } catch (error) {
    console.error('❌ Error calling subjects API:', error);
  }
};

// Run the test
testSubjectsAPI();