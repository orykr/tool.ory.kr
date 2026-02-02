<script lang="ts">
    import { calculateCidrInfo } from '$lib/cidr';

    let inputCidr = '192.168.0.0/24';
    let result = calculateCidrInfo(inputCidr);

    function handleInput() {
        result = calculateCidrInfo(inputCidr);
    }
</script>

<main>
    <nav>
        <a href="/">← Back to Tools</a>
    </nav>
    <h1>CIDR Calculator</h1>
    
    <div class="input-group">
        <label for="cidr">CIDR Input:</label>
        <input 
            id="cidr" 
            type="text" 
            bind:value={inputCidr} 
            on:input={handleInput} 
            placeholder="e.g. 192.168.0.0/24"
        />
    </div>

    {#if result.error}
        <p class="error">{result.error}</p>
    {:else}
        <div class="results">
            <div class="result-item">
                <span class="label">Start IP:</span>
                <span class="value">{result.startIp}</span>
            </div>
            <div class="result-item">
                <span class="label">End IP:</span>
                <span class="value">{result.endIp}</span>
            </div>
            <div class="result-item">
                <span class="label">Subnet Mask:</span>
                <span class="value">{result.subnetMask}</span>
            </div>
        </div>
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
        background-color: #f5f5f5;
    }

    main {
        padding: 2rem;
        max-width: 800px;
        margin: 2rem auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    nav {
        margin-bottom: 2rem;
    }

    nav a {
        text-decoration: none;
        color: #0070f3;
        font-weight: bold;
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 1.5rem;
    }

    label {
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: #555;
    }

    input {
        padding: 0.8rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .results {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 4px;
    }

    .result-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .result-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    .label {
        font-weight: bold;
        color: #666;
        width: 120px;
    }

    .value {
        font-family: monospace;
        font-size: 1.1rem;
        color: #000;
        flex: 1;
        text-align: left;
    }

    .error {
        color: #d32f2f;
        background: #ffebee;
        padding: 1rem;
        border-radius: 4px;
        text-align: center;
    }
</style>