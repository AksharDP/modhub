import Card from "./components/card";
import NavBar from "./components/nav";

export default function Home() {
    return (
        <>
            <NavBar />
            <main>
                <div className="p-8 text-white">
                    <Card
                        title="Sample Card"
                        description="This is a description of the sample card."
                        imageUrl="https://placehold.co/150x150/png"
                        author="JohnDoe"
                        authorPFP="https://placehold.co/50x50/png"
                        category="General"
                        likes={10}
                        downloads={5}
                        size="1MB"
                        uploaded="2023-01-01"
                        lastUpdated="2023-01-02"
                        gameName="samplegame"
                        modId={1}
                    />
                </div>
            </main>
        </>
    );
}
