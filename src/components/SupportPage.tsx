import styles from './SupportPage.module.css';

interface Resource {
    name: string;
    number?: string;
    text?: string;
    url: string;
    description: string;
    category: string;
}

const RESOURCES: Resource[] = [
    {
        category: 'Crisis & Suicide Prevention',
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        url: 'https://988lifeline.org',
        description: 'Free, confidential support for people in suicidal crisis or emotional distress.',
    },
    {
        category: 'Crisis & Suicide Prevention',
        name: 'Crisis Text Line',
        text: 'HOME to 741741',
        url: 'https://www.crisistextline.org',
        description: 'Free crisis counseling via text message.',
    },
    {
        category: 'Substance Abuse',
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        description: 'Free, confidential treatment referrals for substance use disorders.',
    },
    {
        category: 'Substance Abuse',
        name: 'Alcoholics Anonymous',
        url: 'https://www.aa.org',
        description: 'Fellowship and support for people recovering from alcohol use disorder.',
    },
    {
        category: 'Substance Abuse',
        name: 'Narcotics Anonymous',
        url: 'https://www.na.org',
        description: 'Community-based support for people recovering from drug addiction.',
    },
    {
        category: 'Eating Disorders',
        name: 'Alliance for Eating Disorders Helpline',
        number: '1-866-662-1235',
        url: 'https://www.allianceforeatingdisorders.com',
        description: 'Support, resources, and treatment referrals for eating disorders.',
    },
];

const CATEGORIES = [...new Set(RESOURCES.map(r => r.category))];

export function SupportPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Support Resources</h1>
                <p className={styles.subtitle}>
                    You are not alone. These resources are here to help.
                </p>
            </div>

            {CATEGORIES.map(category => (
                <section key={category} className={styles.section}>
                    <h2 className={styles.categoryTitle}>{category}</h2>
                    <div className={styles.cards}>
                        {RESOURCES.filter(r => r.category === category).map(resource => (
                            <a
                                key={resource.name}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.card}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.resourceName}>{resource.name}</span>
                                    <span className={styles.hours}>{resource.hours}</span>
                                </div>
                                <p className={styles.description}>{resource.description}</p>
                                {resource.number && (
                                    <span className={styles.contact}>{resource.number}</span>
                                )}
                                {resource.text && (
                                    <span className={styles.contact}>Text: {resource.text}</span>
                                )}
                            </a>
                        ))}
                    </div>
                </section>
            ))}

            <div className={styles.footer}>
                <a
                    href="https://www.mentalhealth.gov/get-help/immediate-help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                >
                    View more resources at mentalhealth.gov →
                </a>
            </div>
        </div>
    );
}