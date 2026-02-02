<script lang="ts">
    // Main landing page for the toolbox
</script>

<main>
    <h1>ORY TOOLS</h1>
    <p>Select a tool from the list below:</p>

    <div class="tool-grid">
        <a href="/cidr" class="tool-card">
            <h2>CIDR Calculator</h2>
            <p>Calculate IP ranges, subnet masks, and more from CIDR notation.</p>
        </a>
        <!-- More tools will be added here -->
    </div>
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
        max-width: 1200px;
        margin: 0 auto;
    }

    h1 {
        color: #333;
        border-bottom: 2px solid #ddd;
        padding-bottom: 1rem;
        margin-bottom: 2rem;
    }

    .tool-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .tool-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1px solid #eee;
    }

    .tool-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        border-color: #ddd;
    }

    .tool-card h2 {
        margin-top: 0;
        color: #0070f3;
    }

    .tool-card p {
        color: #666;
        line-height: 1.5;
    }
</style>
