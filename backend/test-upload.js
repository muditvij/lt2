async function test() {
    // 1. Register
    const email = 'test' + Date.now() + '@test.com';
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Setup',
            email,
            password: 'password123'
        })
    });
    const regData = await regRes.json();
    const token = regData.token;
    console.log('Registered token:', token);

    if (!token) {
        console.error("Failed to register", regData);
        return;
    }

    // 2. Put profile edit using native FormData (Node 18+)
    const form = new FormData();
    form.append('name', 'Updated Name');
    form.append('bio', 'Updated Bio');
    form.append('location', 'Updated Location');

    try {
        const editRes = await fetch('http://localhost:5000/api/users/edit', {
            method: 'PUT',
            headers: {
                'x-auth-token': token
            },
            body: form
        });

        console.log('Update status:', editRes.status);
        const text = await editRes.text();
        console.log('Update response:', text);
    } catch (err) {
        console.error('Update failed:', err);
    }
}
test();
