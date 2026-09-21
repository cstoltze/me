<script lang="ts">
  let { content, role }: { content: string; role: string } = $props();
</script>

<div data-testid="markdown" data-role={role}>{content}</div>
