export const getChartColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
        text: styles.getPropertyValue("--color-text-muted").trim(),
        grid: styles.getPropertyValue("--color-border-soft").trim(),
        accent: styles.getPropertyValue("--color-accent").trim(),
        success: styles.getPropertyValue("--color-success").trim(),
        danger: styles.getPropertyValue("--color-danger").trim(),
        warning: styles.getPropertyValue("--color-warning").trim(),
        textFaint: styles.getPropertyValue("--color-text-faint").trim(),
        bgAlt: styles.getPropertyValue("--color-bg-alt").trim(),
    };
};

export const CHART_PALETTE = [
    "#3b5bdb", "#3fb950", "#d29922", "#f85149",
    "#8b949e", "#a371f7", "#39c5cf", "#db61a2",
];