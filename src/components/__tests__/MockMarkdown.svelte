<script lang="ts">
    let { content, role } = $props<{ content: string; role: string }>();
</script>

<div data-testid="markdown" data-role={role}>
    {content}
</div>
